import { api } from './client';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
  imageBase64?: string | null;
  content: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export function getTestimonials(): Promise<Testimonial[]> {
  return api.get<Testimonial[]>('/testimonials').then((list) => (Array.isArray(list) ? list : []));
}

/** Public endpoint (no auth) for landing page */
export function getTestimonialsPublic(): Promise<Testimonial[]> {
  return api.getPublic<Testimonial[]>('/testimonials').then((list) => (Array.isArray(list) ? list : []));
}

export function getTestimonialById(id: string): Promise<Testimonial> {
  return api.get<Testimonial>(`/testimonials/${id}`);
}

export interface CreateTestimonialBody {
  name: string;
  role?: string;
  content: string;
  rating?: number;
  avatar?: string;
  imageBase64?: string | null;
}

export function createTestimonial(body: CreateTestimonialBody): Promise<Testimonial> {
  return api.post<Testimonial>('/testimonials', body);
}

export interface UpdateTestimonialBody {
  name?: string;
  role?: string;
  content?: string;
  rating?: number;
  avatar?: string | null;
  imageBase64?: string | null;
}

export function updateTestimonial(id: string, body: UpdateTestimonialBody): Promise<Testimonial> {
  return api.patch<Testimonial>(`/testimonials/${id}`, body);
}

export function deleteTestimonial(id: string): Promise<void> {
  return api.delete<void>(`/testimonials/${id}`);
}

export const MAX_TESTIMONIAL_IMAGE_BYTES = 1024 * 1024; // 1MB
