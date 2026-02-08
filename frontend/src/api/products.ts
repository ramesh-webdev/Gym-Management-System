import { api } from './client';
import type { Product } from '@/types';

export function getProducts(): Promise<Product[]> {
  return api.get<Product[]>('/products').then((list) => (Array.isArray(list) ? list : []));
}

export function getProductById(id: string): Promise<Product> {
  return api.get<Product>(`/products/${id}`);
}

export interface CreateProductBody {
  name: string;
  description?: string;
  price: number;
  category: Product['category'];
  image?: string;
  cloudinaryId?: string;
  stock?: number;
  status?: Product['status'];
}

export function createProduct(body: CreateProductBody): Promise<Product> {
  return api.post<Product>('/products', body);
}

export interface UpdateProductBody {
  name?: string;
  description?: string;
  price?: number;
  category?: Product['category'];
  image?: string;
  cloudinaryId?: string;
  stock?: number;
  status?: Product['status'];
}

export function updateProduct(id: string, body: UpdateProductBody): Promise<Product> {
  return api.put<Product>(`/products/${id}`, body);
}

export function deleteProduct(id: string): Promise<void> {
  return api.delete<void>(`/products/${id}`);
}
