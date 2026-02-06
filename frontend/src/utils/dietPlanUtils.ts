import type { DietPlan } from '@/types';
import { mockDietPlan } from '@/data/mockData';

const STORAGE_KEY = 'ko_fitness_diet_plans';

// Initialize with mock data if storage is empty
function initializeDietPlans(): DietPlan[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const plans = JSON.parse(stored);
      // Convert date strings back to Date objects if needed
      return plans.map((plan: DietPlan) => ({
        ...plan,
        meals: plan.meals.map(meal => ({
          ...meal,
        })),
      }));
    } catch {
      // If parsing fails, use default
    }
  }
  // Default with mock diet plan
  return [mockDietPlan];
}

// Get all diet plans
export function getAllDietPlans(): DietPlan[] {
  return initializeDietPlans();
}

// Get diet plan for a specific member
export function getDietPlanForMember(memberId: string): DietPlan | null {
  const plans = getAllDietPlans();
  return plans.find((plan) => plan.memberId === memberId) || null;
}

// Save diet plans to storage
export function saveDietPlans(plans: DietPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('dietPlansUpdated'));
}

// Add or update a diet plan
export function saveDietPlan(plan: DietPlan): void {
  const plans = getAllDietPlans();
  const existingIndex = plans.findIndex((p) => p.id === plan.id);
  
  if (existingIndex >= 0) {
    plans[existingIndex] = plan;
  } else {
    plans.push(plan);
  }
  
  saveDietPlans(plans);
}

// Delete a diet plan
export function deleteDietPlan(planId: string): void {
  const plans = getAllDietPlans();
  const filtered = plans.filter((p) => p.id !== planId);
  saveDietPlans(filtered);
}
