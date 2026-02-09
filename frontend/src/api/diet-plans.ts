import { api } from './client';
import type { DietPlan } from '@/types';

export function getDietPlans(memberId?: string): Promise<DietPlan[]> {
  const url = memberId ? `/diet-plans?memberId=${memberId}` : '/diet-plans';
  return api.get<DietPlan[]>(url).then((list) => (Array.isArray(list) ? list : []));
}

export function getDietPlanById(id: string): Promise<DietPlan> {
  return api.get<DietPlan>(`/diet-plans/${id}`);
}

/**
 * Get diet plan for current logged-in member.
 */
export function getMyDietPlan(): Promise<DietPlan> {
  return api.get<DietPlan>('/diet-plans/my-plan');
}

export interface CreateDietPlanBody {
  memberId: string;
  name: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: string[];
    calories: number;
    time: string;
  }>;
}

export function createDietPlan(body: CreateDietPlanBody): Promise<DietPlan> {
  return api.post<DietPlan>('/diet-plans', body);
}

export interface UpdateDietPlanBody {
  name?: string;
  memberId?: string;
  dailyCalories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  meals?: Array<{
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: string[];
    calories: number;
    time: string;
  }>;
}

export function updateDietPlan(id: string, body: UpdateDietPlanBody): Promise<DietPlan> {
  return api.put<DietPlan>(`/diet-plans/${id}`, body);
}

export function deleteDietPlan(id: string): Promise<void> {
  return api.delete<void>(`/diet-plans/${id}`);
}
