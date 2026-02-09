import { api } from './client';
import type { Trainer, Member, DietPlan } from '@/types';

export interface TrainerListItem {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  specialization: string[];
  experience: number;
  bio: string;
  rating: number;
  status: string;
  clientsCount?: number;
}

export function getTrainers(status?: string): Promise<TrainerListItem[]> {
  const query = status ? `?status=${status}` : '';
  return api.get<TrainerListItem[]>(`/trainers${query}`);
}

export function getTrainerById(id: string): Promise<Trainer> {
  return api.get<Trainer>(`/trainers/${id}`);
}

export interface CreateTrainerBody {
  name: string;
  phone: string;
  password: string;
  specialization: string[];
  experience?: number;
  bio?: string;
}

export function createTrainer(body: CreateTrainerBody): Promise<Trainer> {
  return api.post<Trainer>('/trainers', body);
}

export interface UpdateTrainerBody {
  name?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  specialization?: string[];
  experience?: number;
  bio?: string;
  newPassword?: string;
}

export function updateTrainer(id: string, body: UpdateTrainerBody): Promise<Trainer> {
  return api.put<Trainer>(`/trainers/${id}`, body);
}

export function deleteTrainer(id: string): Promise<void> {
  return api.delete<void>(`/trainers/${id}`);
}

export function getMyClients(): Promise<Member[]> {
  return api.get<Member[]>('/trainers/my-clients');
}

export interface TrainerClientDietPlan {
  id: string;
  clientId: string;
  clientName: string;
  nutritionistName: string;
  name: string;
  dailyCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  meals: Array<{ type: string; foods: string[]; calories: number; time?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export function getMyClientsDietPlans(): Promise<TrainerClientDietPlan[]> {
  return api.get<TrainerClientDietPlan[]>('/trainers/my-diet-plans').then((list) => (Array.isArray(list) ? list : []));
}

export function getClientDetails(clientId: string): Promise<Member & { dietPlan?: DietPlan | null }> {
  return api.get<Member & { dietPlan?: DietPlan | null }>(`/trainers/clients/${clientId}`);
}

export function getMyProfile(): Promise<Trainer> {
  return api.get<Trainer>('/trainers/my-profile');
}
