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
 * Login with phone and password. Optionally pass role (admin/member/trainer).
 * On success: stores user + token in localStorage and returns user.
 */
export async function login(
  phone: string,
  password: string,
  role?: 'admin' | 'member' | 'trainer'
): Promise<User> {
  const body: { phone: string; password: string; role?: 'admin' | 'member' | 'trainer' } = {
    phone: phone.trim(),
    password,
  };
  if (role) body.role = role;

  const res = await api.post<{ user: User; accessToken: string }>('/auth/login', body);
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
  };
  if (raw.membershipExpiry) (user as UserFromStorage).membershipExpiry = parseDate(raw.membershipExpiry);
  if (raw.joinDate) (user as UserFromStorage).joinDate = parseDate(raw.joinDate);
  return user;
}
