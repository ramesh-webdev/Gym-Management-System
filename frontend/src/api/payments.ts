import { api } from './client';
import type { Payment, PaginatedResponse } from '@/types';

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
}

export function listPayments(params?: ListPaymentsParams): Promise<PaginatedResponse<Payment>> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.status && params.status !== 'all') search.set('status', params.status);
  if (params?.search?.trim()) search.set('search', params.search.trim());
  if (params?.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params?.dateTo) search.set('dateTo', params.dateTo);
  const qs = search.toString();
  return api.get<PaginatedResponse<Payment>>(`/payments${qs ? `?${qs}` : ''}`);
}

export interface CreatePaymentBody {
  memberId: string;
  memberName: string;
  amount: number;
  type: Payment['type'];
  status?: Payment['status'];
  dueDate?: string; // ISO
  /** For type 'membership': specific plan (new/upgrade); omit for renewal (current plan). */
  membershipPlanId?: string;
  /** For type 'membership': add personal training add-on. */
  addPersonalTraining?: boolean;
}

export function createPayment(body: CreatePaymentBody): Promise<Payment> {
  return api.post<Payment>('/payments', body);
}

export interface UpdatePaymentBody {
  status: Payment['status'];
}

export function updatePayment(id: string, body: UpdatePaymentBody): Promise<Payment> {
  return api.put<Payment>(`/payments/${id}`, body);
}

// Razorpay-style flow (auto-approve: no real gateway; verify marks paid)
export interface CreateOrderBody {
  amount: number; // in rupees
  type: Payment['type'];
  /** For type 'membership': optional plan id to switch to (omit to renew current plan) */
  membershipPlanId?: string;
  /** For type 'membership': add personal training add-on (member-level, not part of plan) */
  addPersonalTraining?: boolean;
  /** For type 'product': product id (so admin payment list can show product name) */
  productId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  paymentId: string;
  amount: number; // paise (for Razorpay UI)
  currency: string;
  key: string;
}

export function createOrder(body: CreateOrderBody): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>('/payments/create-order', body);
}

export interface VerifyPaymentBody {
  orderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment: Payment;
}

export function verifyPayment(body: VerifyPaymentBody): Promise<VerifyPaymentResponse> {
  return api.post<VerifyPaymentResponse>('/payments/verify', body);
}

/** Cancel a pending order (e.g. user closed Razorpay without paying). */
export function cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  return api.post<{ success: boolean; message: string }>('/payments/cancel-order', { orderId });
}
