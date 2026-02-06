import type { Recipe } from '@/types';

const STORAGE_KEY = 'ko_fitness_recipes';

// Initialize with empty array or default recipes
function initializeRecipes(): Recipe[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const recipes = JSON.parse(stored);
      // Convert date strings back to Date objects
      return recipes.map((recipe: Recipe) => ({
        ...recipe,
        createdAt: new Date(recipe.createdAt),
      }));
    } catch {
      // If parsing fails, return empty array
    }
  }
  return [];
}

// Get all recipes
export function getAllRecipes(): Recipe[] {
  return initializeRecipes();
}

// Get active recipes only
export function getActiveRecipes(): Recipe[] {
  return getAllRecipes().filter((recipe) => recipe.isActive);
}

// Get recipes by category
export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return getActiveRecipes().filter((recipe) => recipe.category === category);
}

// Get recipe by ID
export function getRecipeById(id: string): Recipe | null {
  const recipes = getAllRecipes();
  return recipes.find((recipe) => recipe.id === id) || null;
}

// Save recipes to storage
export function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('recipesUpdated'));
}

// Add or update a recipe
export function saveRecipe(recipe: Recipe): void {
  const recipes = getAllRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipe.id);
  
  if (existingIndex >= 0) {
    recipes[existingIndex] = recipe;
  } else {
    recipes.push(recipe);
  }
  
  saveRecipes(recipes);
}

// Delete a recipe
export function deleteRecipe(recipeId: string): void {
  const recipes = getAllRecipes();
  const filtered = recipes.filter((r) => r.id !== recipeId);
  saveRecipes(filtered);
}
