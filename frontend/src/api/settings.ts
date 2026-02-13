import { api } from './client';

export interface WorkingHoursEntry {
  days: string;
  open: string;
  close: string;
}

export interface GymSettingsResponse {
  id?: string;
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  logo?: string;
  workingHours?: { entries: WorkingHoursEntry[] };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string };
  personalTrainingPrice: number;
}

export interface PublicSettingsResponse {
  address: string;
  phone: string;
  email: string;
  workingHours: { entries: WorkingHoursEntry[] };
}

export function getSettings(): Promise<GymSettingsResponse> {
  return api.get<GymSettingsResponse>('/settings');
}

export function getPublicSettings(): Promise<PublicSettingsResponse> {
  return api.getPublic<PublicSettingsResponse>('/settings/public');
}

export interface UpdateSettingsBody {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  logo?: string;
  workingHours?: { entries: WorkingHoursEntry[] };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string };
  personalTrainingPrice?: number;
}

export function updateSettings(body: UpdateSettingsBody): Promise<GymSettingsResponse> {
  return api.patch<GymSettingsResponse>('/settings', body);
}
