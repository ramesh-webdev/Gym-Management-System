import { api } from './client';

export interface GymSettingsResponse {
  id?: string;
  name?: string;
  address?: string;
  phone?: string;
  logo?: string;
  workingHours?: { open: string; close: string; days: string[] };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string };
  personalTrainingPrice: number;
}

export function getSettings(): Promise<GymSettingsResponse> {
  return api.get<GymSettingsResponse>('/settings');
}

export interface UpdateSettingsBody {
  name?: string;
  address?: string;
  phone?: string;
  logo?: string;
  workingHours?: { open: string; close: string; days: string[] };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string };
  personalTrainingPrice?: number;
}

export function updateSettings(body: UpdateSettingsBody): Promise<GymSettingsResponse> {
  return api.patch<GymSettingsResponse>('/settings', body);
}
