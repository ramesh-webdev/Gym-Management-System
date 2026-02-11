import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Utensils,
  Clock,
  Users,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '@/api/recipes';
import type { Recipe } from '@/types';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export function RecipeManagement() {
  const confirmDialog = useConfirmDialog();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Partial<Recipe>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const ingredients = (formData.get('ingredients') as string)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      
      const instructions = (formData.get('instructions') as string)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      
      const tags = (formData.get('tags') as string)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await createRecipe({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as Recipe['category'],
        image: formData.get('image') as string || undefined,
        prepTime: Number(formData.get('prepTime')),
        cookTime: Number(formData.get('cookTime')),
        servings: Number(formData.get('servings')),
        calories: Number(formData.get('calories')),
        macros: {
          protein: Number(formData.get('protein')),
          carbs: Number(formData.get('carbs')),
          fats: Number(formData.get('fats')),
        },
        ingredients: ingredients,
        instructions: instructions,
        tags: tags,
        isActive: true,
      });

      toast.success('Recipe created successfully');
      setIsAddDialogOpen(false);
      (e.target as HTMLFormElement).reset();
      await loadRecipes();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecipe.id) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const ingredients = (formData.get('ingredients') as string)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      
      const instructions = (formData.get('instructions') as string)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      
      const tags = (formData.get('tags') as string)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await updateRecipe(currentRecipe.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as Recipe['category'],
        image: formData.get('image') as string || undefined,
        prepTime: Number(formData.get('prepTime')),
        cookTime: Number(formData.get('cookTime')),
        servings: Number(formData.get('servings')),
        calories: Number(formData.get('calories')),
        macros: {
          protein: Number(formData.get('protein')),
          carbs: Number(formData.get('carbs')),
          fats: Number(formData.get('fats')),
        },
        ingredients: ingredients,
        instructions: instructions,
        tags: tags,
      });

      toast.success('Recipe updated successfully');
      setIsEditDialogOpen(false);
      await loadRecipes();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete recipe',
      description: 'Are you sure you want to delete this recipe?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteRecipe(id);
      toast.success('Recipe deleted successfully');
      await loadRecipes();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete recipe');
    }
  };

  const handleToggleActive = async (recipe: Recipe) => {
    try {
      await updateRecipe(recipe.id, { isActive: !recipe.isActive });
      toast.success(`Recipe ${!recipe.isActive ? 'activated' : 'deactivated'} successfully`);
      await loadRecipes();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update recipe status');
    }
  };

  const categoryColors: Record<string, string> = {
    breakfast: 'bg-orange-500/20 text-orange-500',
    lunch: 'bg-blue-500/20 text-blue-500',
    dinner: 'bg-purple-500/20 text-purple-500',
    snack: 'bg-green-500/20 text-green-500',
    dessert: 'bg-pink-500/20 text-pink-500',
    smoothie: 'bg-cyan-500/20 text-cyan-500',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Recipes</h1>
          <p className="text-muted-foreground">Create and manage healthy recipes for all members</p>
        </div>

        {/* Add Recipe Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Create New Recipe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRecipe} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Recipe Name</label>
                  <Input
                    name="name"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="e.g., Protein Power Smoothie"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                  <select
                    name="category"
                    required
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                    <option value="smoothie">Smoothie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Textarea
                  name="description"
                  required
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="Brief description of the recipe..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Image URL (optional)</label>
                <Input
                  name="image"
                  type="url"
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Prep Time (min)</label>
                  <Input
                    name="prepTime"
                    type="number"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Cook Time (min)</label>
                  <Input
                    name="cookTime"
                    type="number"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Servings</label>
                  <Input
                    name="servings"
                    type="number"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Calories per Serving</label>
                <Input
                  name="calories"
                  type="number"
                  required
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="350"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Macros per Serving</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Protein (g)</label>
                    <Input
                      name="protein"
                      type="number"
                      required
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Carbs (g)</label>
                    <Input
                      name="carbs"
                      type="number"
                      required
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fats (g)</label>
                    <Input
                      name="fats"
                      type="number"
                      required
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="12"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Ingredients (one per line)</label>
                <Textarea
                  name="ingredients"
                  required
                  className="bg-muted/50 border-border text-foreground font-mono text-sm"
                  placeholder="2 cups spinach&#10;1 banana&#10;1 scoop protein powder&#10;1 cup almond milk"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Instructions (one per line)</label>
                <Textarea
                  name="instructions"
                  required
                  className="bg-muted/50 border-border text-foreground font-mono text-sm"
                  placeholder="Add all ingredients to blender&#10;Blend until smooth&#10;Pour into glass and serve"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tags (comma-separated)</label>
                <Input
                  name="tags"
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="high-protein, quick, vegan, gluten-free"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Recipe'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
        >
          <option value="all">All Categories</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="dessert">Dessert</option>
          <option value="smoothie">Smoothie</option>
        </select>
      </div>

      {/* Recipes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Utensils className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Utensils className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recipes found. Create your first recipe!</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="p-6 rounded-xl bg-card/50 border border-border hover:border-border transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display text-xl font-bold text-foreground">{recipe.name}</h3>
                    {!recipe.isActive && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <Badge className={`${categoryColors[recipe.category] || 'bg-muted text-muted-foreground'} text-xs`}>
                    {recipe.category}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem
                      className="text-foreground hover:bg-muted cursor-pointer"
                      onClick={() => handleEditClick(recipe)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-foreground hover:bg-muted cursor-pointer"
                      onClick={() => handleToggleActive(recipe)}
                    >
                      {recipe.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Image */}
              {recipe.image && (
                <div className="w-full h-48 rounded-lg bg-muted mb-4 overflow-hidden">
                  <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{recipe.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-ko-500" />
                  <span className="text-foreground font-medium">{recipe.calories} kcal</span>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-muted/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-sm font-medium text-foreground">{recipe.macros.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-sm font-medium text-foreground">{recipe.macros.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Fats</p>
                  <p className="text-sm font-medium text-foreground">{recipe.macros.fats}g</p>
                </div>
              </div>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">+{recipe.tags.length - 3}</Badge>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Recipe</DialogTitle>
          </DialogHeader>
          {currentRecipe.id && (
            <form onSubmit={handleUpdateRecipe} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Recipe Name</label>
                  <Input
                    name="name"
                    required
                    defaultValue={currentRecipe.name}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                  <select
                    name="category"
                    required
                    defaultValue={currentRecipe.category}
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                    <option value="smoothie">Smoothie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Textarea
                  name="description"
                  required
                  defaultValue={currentRecipe.description}
                  className="bg-muted/50 border-border text-foreground"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Image URL (optional)</label>
                <Input
                  name="image"
                  type="url"
                  defaultValue={currentRecipe.image}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Prep Time (min)</label>
                  <Input
                    name="prepTime"
                    type="number"
                    required
                    defaultValue={currentRecipe.prepTime}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Cook Time (min)</label>
                  <Input
                    name="cookTime"
                    type="number"
                    required
                    defaultValue={currentRecipe.cookTime}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Servings</label>
                  <Input
                    name="servings"
                    type="number"
                    required
                    defaultValue={currentRecipe.servings}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Calories per Serving</label>
                <Input
                  name="calories"
                  type="number"
                  required
                  defaultValue={currentRecipe.calories}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Macros per Serving</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Protein (g)</label>
                    <Input
                      name="protein"
                      type="number"
                      required
                      defaultValue={currentRecipe.macros?.protein}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Carbs (g)</label>
                    <Input
                      name="carbs"
                      type="number"
                      required
                      defaultValue={currentRecipe.macros?.carbs}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fats (g)</label>
                    <Input
                      name="fats"
                      type="number"
                      required
                      defaultValue={currentRecipe.macros?.fats}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Ingredients (one per line)</label>
                <Textarea
                  name="ingredients"
                  required
                  defaultValue={currentRecipe.ingredients?.join('\n')}
                  className="bg-muted/50 border-border text-foreground font-mono text-sm"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Instructions (one per line)</label>
                <Textarea
                  name="instructions"
                  required
                  defaultValue={currentRecipe.instructions?.join('\n')}
                  className="bg-muted/50 border-border text-foreground font-mono text-sm"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tags (comma-separated)</label>
                <Input
                  name="tags"
                  defaultValue={currentRecipe.tags?.join(', ')}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                {isSubmitting ? 'Updating...' : 'Update Recipe'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
