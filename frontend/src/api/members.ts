import { api } from './client';
import type { Member } from '@/types';

export function getMembers(): Promise<Member[]> {
  return api.get<Member[]>('/members').then((list) => (Array.isArray(list) ? list : []));
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
