import { mockMembers } from '@/data/mockData';
import type { Member } from '@/types';

/**
 * Get the current member based on user ID
 * In a real app, this would fetch from an API
 */
export function getCurrentMember(userId: string | undefined): Member | null {
  if (!userId) return null;
  return mockMembers.find(m => m.id === userId) || null;
}

/**
 * Check if the current member has personal training
 */
export function hasPersonalTraining(userId: string | undefined): boolean {
  const member = getCurrentMember(userId);
  return member?.hasPersonalTraining ?? false;
}
