import { api } from './client';
import type { PaginatedResponse } from '@/types';

export interface UserListItem {
  id: string;
  name: string;
  role: string;
}

export interface GetUsersListParams {
  page?: number;
  limit?: number;
}

/** Admin only: list all users (id, name, role) for dropdowns e.g. notification recipient filter. */
export function getUsersList(params?: GetUsersListParams): Promise<PaginatedResponse<UserListItem>> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  return api.get<PaginatedResponse<UserListItem>>(`/users/list${qs ? `?${qs}` : ''}`);
}
