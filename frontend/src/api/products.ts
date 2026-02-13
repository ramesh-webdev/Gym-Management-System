import { api } from './client';
import type { Product, PaginatedResponse } from '@/types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
}

export function getProducts(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.category && params.category !== 'all') search.set('category', params.category);
  if (params?.status && params.status !== 'all') search.set('status', params.status);
  const qs = search.toString();
  return api.get<PaginatedResponse<Product>>(`/products${qs ? `?${qs}` : ''}`);
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
