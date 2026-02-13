import { api } from './client';
import type { DashboardOverviewResponse } from '@/types';

export interface DashboardOverviewParams {
  dateFrom?: string; // ISO date string
  dateTo?: string;   // ISO date string
}

/**
 * Get admin dashboard overview: stats, revenue chart, recent members, recent payments, expiring members.
 * Optional dateFrom/dateTo filter chart and lists by range; stats include periodRevenue/periodNewMembers when filtered.
 * Admin only.
 */
export function getDashboardOverview(params?: DashboardOverviewParams): Promise<DashboardOverviewResponse> {
  const search = new URLSearchParams();
  if (params?.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params?.dateTo) search.set('dateTo', params.dateTo);
  const qs = search.toString();
  return api.get<DashboardOverviewResponse>(`/dashboard/overview${qs ? `?${qs}` : ''}`);
}
