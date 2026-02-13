import { api } from './client';
import type { Notification, PaginatedResponse } from '@/types';

export type NotificationFilter = 'all' | 'unread' | 'read';

export interface ListNotificationsParams {
  filter?: NotificationFilter;
  kind?: string;
  type?: string; // info | success | warning | error | payment
  userId?: string; // admin only: one user's notifications
  scope?: 'all'; // admin only: every notification in the system (Management page)
  page?: number;
  limit?: number;
}

export function listNotifications(params?: ListNotificationsParams): Promise<PaginatedResponse<Notification>> {
  const search = new URLSearchParams();
  if (params?.filter) search.set('filter', params.filter);
  if (params?.kind) search.set('kind', params.kind);
  if (params?.type) search.set('type', params.type);
  if (params?.userId) search.set('userId', params.userId);
  if (params?.scope === 'all') search.set('scope', 'all');
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  return api.get<PaginatedResponse<Notification>>(`/notifications${qs ? `?${qs}` : ''}`);
}

export function getUnreadCount(userId?: string): Promise<{ count: number }> {
  const qs = userId ? `?userId=${userId}` : '';
  return api.get<{ count: number }>(`/notifications/unread-count${qs}`);
}

export interface CreateNotificationBody {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'payment';
  kind?: string;
  link?: string | null;
  userId?: string;
  /** 'all' | 'admins' | 'members' | 'trainers' | string[] */
  recipients?: 'all' | 'admins' | 'members' | 'trainers' | string[];
}

export function createNotification(body: CreateNotificationBody): Promise<Notification | { created: number; notifications: Notification[] }> {
  return api.post<Notification | { created: number; notifications: Notification[] }>('/notifications', body);
}

export function markNotificationRead(id: string): Promise<{ id: string; isRead: boolean }> {
  return api.patch<{ id: string; isRead: boolean }>(`/notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return api.patch<{ updated: number }>('/notifications/read-all');
}

export function deleteNotification(id: string): Promise<void> {
  return api.delete<void>(`/notifications/${id}`);
}

/** Admin only: create "membership expiring soon" notifications for members with expiry in 2–7 days. */
export function seedExpiringMembershipNotifications(): Promise<{ created: number; message: string }> {
  return api.get<{ created: number; message: string }>('/notifications/seed-expiring');
}
