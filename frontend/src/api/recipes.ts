import { api } from './client';
import type { Recipe } from '@/types';

export function getRecipes(category?: Recipe['category'], isActive?: boolean): Promise<Recipe[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (isActive !== undefined) params.append('isActive', String(isActive));
  const query = params.toString();
  const url = query ? `/recipes?${query}` : '/recipes';
  return api.get<Recipe[]>(url).then((list) => (Array.isArray(list) ? list : []));
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
