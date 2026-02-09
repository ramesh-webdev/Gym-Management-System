import { api } from './client';
import type { User } from '@/types';

const USER_KEY = 'user';
const TOKEN_KEY = 'accessToken';

/** User as stored from API (dates may be strings) */
type UserFromStorage = User & {
  membershipExpiry?: Date | string;
  joinDate?: Date | string;
};

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return undefined;
}

/** Parse user from localStorage and convert date strings to Date */
function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserFromStorage;
    const user: User = {
      ...parsed,
      createdAt: parseDate(parsed.createdAt) ?? new Date(),
      lastLogin: parseDate(parsed.lastLogin),
      hasPersonalTraining: parsed.hasPersonalTraining as boolean | undefined,
    };
    if (parsed.membershipExpiry) (user as UserFromStorage).membershipExpiry = parseDate(parsed.membershipExpiry);
    if (parsed.joinDate) (user as UserFromStorage).joinDate = parseDate(parsed.joinDate);
    return user;
  } catch {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

/**
 * Login with phone and password. Server returns the user with their actual role.
 * On success: stores user + token in localStorage and returns user.
 */
export async function login(phone: string, password: string): Promise<User> {
  const res = await api.post<{ user: User; accessToken: string }>('/auth/login', {
    phone: phone.trim(),
    password,
  });
  localStorage.setItem(TOKEN_KEY, res.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  return parseStoredUser(JSON.stringify(res.user)) ?? res.user;
}

/**
 * Register a new member (self-signup).
 * On success: stores user + token in localStorage and returns user.
 */
export async function register(name: string, phone: string, password: string): Promise<User> {
  const res = await api.post<{ user: User; accessToken: string }>('/auth/register', {
    name: name.trim(),
    phone: phone.trim(),
    password,
  });
  localStorage.setItem(TOKEN_KEY, res.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  return parseStoredUser(JSON.stringify(res.user)) ?? res.user;
}

/** Get current user from localStorage (for initial load / refresh). */
export function getStoredUser(): User | null {
  return parseStoredUser(localStorage.getItem(USER_KEY));
}

/** Get current access token. */
export function getStoredToken(): string | null {
  return api.getToken();
}

/** Logout: clear token and user from localStorage. */
export function logout(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Change password for the current user.
 * Requires current password and new password (min 6 characters).
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/users/me/password', { currentPassword, newPassword });
}

/** Fetch current user from API (validates token, returns latest user). */
export async function fetchMe(): Promise<User> {
  const raw = await api.get<Record<string, unknown>>('/users/me');
  const user: User = {
    id: raw.id as string,
    name: raw.name as string,
    phone: raw.phone as string,
    role: raw.role as User['role'],
    status: (raw.status as User['status']) ?? 'active',
    createdAt: parseDate(raw.createdAt) ?? new Date(),
    lastLogin: parseDate(raw.lastLogin),
    avatar: raw.avatar as string | undefined,
    isSuperAdmin: raw.isSuperAdmin as boolean | undefined,
    permissions: raw.permissions as string[] | undefined,
    isOnboarded: raw.isOnboarded as boolean | undefined,
    hasPersonalTraining: raw.hasPersonalTraining as boolean | undefined,
  };
  if (raw.membershipExpiry) (user as UserFromStorage).membershipExpiry = parseDate(raw.membershipExpiry);
  if (raw.joinDate) (user as UserFromStorage).joinDate = parseDate(raw.joinDate);
  // Include onboardingData if present (for members)
  if (raw.onboardingData) {
    (user as any).onboardingData = raw.onboardingData;
  }
  return user;
}

/**
 * Update current user's profile (self-service).
 * Used for onboarding data and profile updates.
 */
export async function updateMe(body: {
  name?: string;
  avatar?: string;
  onboardingData?: import('@/types').MemberOnboardingData;
  isOnboarded?: boolean;
}): Promise<User> {
  const raw = await api.patch<Record<string, unknown>>('/users/me', body);
  const user: User = {
    id: raw.id as string,
    name: raw.name as string,
    phone: raw.phone as string,
    role: raw.role as User['role'],
    status: (raw.status as User['status']) ?? 'active',
    createdAt: parseDate(raw.createdAt) ?? new Date(),
    lastLogin: parseDate(raw.lastLogin),
    avatar: raw.avatar as string | undefined,
    isSuperAdmin: raw.isSuperAdmin as boolean | undefined,
    permissions: raw.permissions as string[] | undefined,
    isOnboarded: raw.isOnboarded as boolean | undefined,
  };
  if (raw.membershipExpiry) (user as UserFromStorage).membershipExpiry = parseDate(raw.membershipExpiry);
  if (raw.joinDate) (user as UserFromStorage).joinDate = parseDate(raw.joinDate);
  // Update localStorage
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
