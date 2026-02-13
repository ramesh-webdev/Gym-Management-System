import { api } from './client';
import type { PaginatedResponse } from '@/types';

export interface ContactMessage {
    id: string;
    name: string;
    phone: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: string;
    updatedAt: string;
}

export interface CreateMessageData {
    name: string;
    phone: string;
    message: string;
}

export interface FetchMessagesParams {
    page?: number;
    limit?: number;
    status?: 'all' | 'new' | 'read' | 'replied';
    search?: string;
}

export const sendContactMessage = async (data: CreateMessageData): Promise<ContactMessage> => {
    const response = await api.post<ContactMessage>('/contact', data);
    return response as unknown as ContactMessage;
};

export const fetchMessages = async (params?: FetchMessagesParams): Promise<PaginatedResponse<ContactMessage>> => {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') search.set('status', params.status);
    if (params?.search?.trim()) search.set('search', params.search.trim());
    const qs = search.toString();
    const response = await api.get<PaginatedResponse<ContactMessage>>(`/contact${qs ? `?${qs}` : ''}`);
    return response as unknown as PaginatedResponse<ContactMessage>;
};

export const updateMessageStatus = async (id: string, status: ContactMessage['status']): Promise<ContactMessage> => {
    const response = await api.patch<ContactMessage>(`/contact/${id}`, { status });
    return response as unknown as ContactMessage;
};

export const deleteMessage = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/contact/${id}`);
    return response as unknown as { message: string };
};
