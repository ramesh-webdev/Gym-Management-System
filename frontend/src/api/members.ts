import { api } from './client';
import type { Member, PaginatedResponse } from '@/types';

export interface GetMembersParams {
  page?: number;
  limit?: number;
  /** Search by name or phone */
  search?: string;
  status?: string;
  planId?: string;
  /** Filter by hasPersonalTraining: 'true' | 'false' */
  pt?: string;
}

export function getMembers(params?: GetMembersParams): Promise<PaginatedResponse<Member>> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.search?.trim()) search.set('search', params.search.trim());
  if (params?.status && params.status !== 'all') search.set('status', params.status);
  if (params?.planId && params.planId !== 'all') search.set('planId', params.planId);
  if (params?.pt === 'true' || params?.pt === 'false') search.set('pt', params.pt);
  const qs = search.toString();
  return api.get<PaginatedResponse<Member>>(`/members${qs ? `?${qs}` : ''}`);
}

export function getMemberById(id: string): Promise<Member> {
  return api.get<Member>(`/members/${id}`);
}

export interface CreateMemberBody {
  name: string;
  phone: string;
  password: string;
  membershipPlanId?: string;
  hasPersonalTraining?: boolean;
  assignedTrainerId?: string;
}

export function createMember(body: CreateMemberBody): Promise<Member> {
  return api.post<Member>('/members', body);
}

export interface UpdateMemberBody {
  name?: string;
  phone?: string;
  status?: Member['status'];
  membershipPlanId?: string | null;
  hasPersonalTraining?: boolean;
  assignedTrainerId?: string | null;
  membershipExpiry?: string; // ISO date string
}


export function updateMember(id: string, body: UpdateMemberBody): Promise<Member> {
  return api.put<Member>(`/members/${id}`, body);
}

export function deleteMember(id: string): Promise<void> {
  return api.delete(`/members/${id}`);
}
