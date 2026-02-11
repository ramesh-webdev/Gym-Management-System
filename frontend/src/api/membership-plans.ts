import { api } from './client';
import type { MembershipPlan } from '@/types';

/** List plans. When called as admin (with auth), returns all; otherwise active only. */
export function getMembershipPlans(): Promise<MembershipPlan[]> {
  return api.get<MembershipPlan[]>('/membership-plans').then((list) => (Array.isArray(list) ? list : []));
}

export function getMembershipPlanById(id: string): Promise<MembershipPlan> {
  return api.get<MembershipPlan>(`/membership-plans/${id}`);
}

export interface CreateMembershipPlanBody {
  name: string;
  description?: string;
  price: number;
  duration?: number; // required for monthly plans; 0 or omit for add-on plans
  features?: string[] | string;
  isPopular?: boolean;
  isActive?: boolean;
  /** Add-on plan (e.g. Personal Training) – not a monthly membership */
  isAddOn?: boolean;
}

export function createMembershipPlan(body: CreateMembershipPlanBody): Promise<MembershipPlan> {
  return api.post<MembershipPlan>('/membership-plans', body);
}

export interface UpdateMembershipPlanBody extends Partial<CreateMembershipPlanBody> {}

export function updateMembershipPlan(id: string, body: UpdateMembershipPlanBody): Promise<MembershipPlan> {
  return api.put<MembershipPlan>(`/membership-plans/${id}`, body);
}

export function deleteMembershipPlan(id: string): Promise<void> {
  return api.delete<void>(`/membership-plans/${id}`);
}
