import { api } from './client';
import type { User } from '@/types';

/** Staff = admin users (role admin). List only returns admins. */
export function getStaff(): Promise<User[]> {
  return api.get<User[]>('/users/staff').then((list) => (Array.isArray(list) ? list : []));
}

export function getStaffById(id: string): Promise<User> {
  return api.get<User>(`/users/staff/${id}`);
}

export interface CreateStaffBody {
  name: string;
  phone: string;
  password: string;
  permissions: string[];
}

export function createStaff(body: CreateStaffBody): Promise<User> {
  return api.post<User>('/users/staff', body);
}

export interface UpdateStaffBody {
  name?: string;
  phone?: string;
  status?: User['status'];
  permissions?: string[];
  newPassword?: string;
}

export function updateStaff(id: string, body: UpdateStaffBody): Promise<User> {
  return api.put<User>(`/users/staff/${id}`, body);
}
