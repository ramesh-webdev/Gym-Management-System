import { api } from './client';
import type { Recipe, PaginatedResponse } from '@/types';

export interface GetRecipesParams {
  page?: number;
  limit?: number;
}

export function getRecipes(
  category?: Recipe['category'],
  isActive?: boolean,
  params?: GetRecipesParams
): Promise<PaginatedResponse<Recipe>> {
  const search = new URLSearchParams();
  if (category) search.set('category', category);
  if (isActive !== undefined) search.set('isActive', String(isActive));
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.limit != null) search.set('limit', String(params.limit));
  const qs = search.toString();
  const url = qs ? `/recipes?${qs}` : '/recipes';
  return api.get<PaginatedResponse<Recipe>>(url);
}

export function getRecipeById(id: string): Promise<Recipe> {
  return api.get<Recipe>(`/recipes/${id}`);
}

export interface CreateRecipeBody {
  name: string;
  description?: string;
  category: Recipe['category'];
  image?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients: string[];
  instructions: string[];
  tags: string[];
  isActive?: boolean;
}

export function createRecipe(body: CreateRecipeBody): Promise<Recipe> {
  return api.post<Recipe>('/recipes', body);
}

export interface UpdateRecipeBody {
  name?: string;
  description?: string;
  category?: Recipe['category'];
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  isActive?: boolean;
}

export function updateRecipe(id: string, body: UpdateRecipeBody): Promise<Recipe> {
  return api.put<Recipe>(`/recipes/${id}`, body);
}

export function deleteRecipe(id: string): Promise<void> {
  return api.delete<void>(`/recipes/${id}`);
}
