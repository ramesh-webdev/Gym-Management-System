import { api } from './client';

export interface UserListItem {
  id: string;
  name: string;
  role: string;
}

/** Admin only: list all users (id, name, role) for dropdowns e.g. notification recipient filter. */
export function getUsersList(): Promise<UserListItem[]> {
  return api.get<UserListItem[]>('/users/list');
}
