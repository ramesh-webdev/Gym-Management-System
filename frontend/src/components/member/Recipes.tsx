import { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  Users,
  Flame,
  Utensils,
  Apple,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRecipes } from '@/api/recipes';
import type { Recipe } from '@/types';

export function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      // Get only active recipes (public view)
      const data = await getRecipes(undefined, true);
      setRecipes(data);
    } catch (error: any) {
      console.error('Failed to load recipes:', error);
      // Don't show toast for members, just log
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

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDialogOpen(true);
  };

  const categoryColors: Record<string, string> = {
    breakfast: 'bg-orange-500/20 text-orange-500',
    lunch: 'bg-blue-500/20 text-blue-500',
    dinner: 'bg-purple-500/20 text-purple-500',
    snack: 'bg-green-500/20 text-green-500',
    dessert: 'bg-pink-500/20 text-pink-500',
    smoothie: 'bg-cyan-500/20 text-cyan-500',
  };

  const categoryIcons: Record<string, typeof Apple> = {
    breakfast: Apple,
    lunch: Utensils,
    dinner: Utensils,
    snack: Apple,
    dessert: Apple,
    smoothie: Apple,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Recipes</h1>
          <p className="text-muted-foreground">Discover healthy and delicious recipes</p>
        </div>
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
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className={categoryFilter === 'all' ? 'bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground' : ''}
          >
            All
          </Button>
          {['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'smoothie'].map((cat) => {
            const Icon = categoryIcons[cat] || Utensils;
            return (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-2 ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading recipes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No recipes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const Icon = categoryIcons[recipe.category] || Utensils;
            return (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe)}
                className="p-6 rounded-xl bg-card/50 border border-border hover:border-ko-500/50 transition-all cursor-pointer group"
              >
                {/* Image */}
                {recipe.image ? (
                  <div className="w-full h-48 rounded-lg bg-muted mb-4 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg bg-gradient-to-br from-ko-500/20 to-koBlue-500/20 mb-4 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-ko-500/50" />
                  </div>
                )}

                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-xl font-bold text-foreground group-hover:text-ko-500 transition-colors">
                      {recipe.name}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-ko-500 transition-colors" />
                  </div>
                  <Badge className={`${categoryColors[recipe.category] || 'bg-muted text-muted-foreground'} text-xs`}>
                    {recipe.category}
                  </Badge>
                </div>

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
                    <span className="text-muted-foreground">{recipe.servings}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-ko-500" />
                    <span className="text-foreground font-medium">{recipe.calories} kcal</span>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30">
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
                  <div className="flex flex-wrap gap-2 mt-4">
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
            );
          })}
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selectedRecipe.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                {/* Image */}
                {selectedRecipe.image && (
                  <div className="w-full h-64 rounded-lg bg-muted overflow-hidden">
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <p className="text-muted-foreground">{selectedRecipe.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Prep</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecipe.prepTime} min</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Cook</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecipe.cookTime} min</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Servings</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecipe.servings}</p>
                  </div>
                  <div className="text-center">
                    <Flame className="w-5 h-5 mx-auto mb-2 text-ko-500" />
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="text-sm font-medium text-foreground">{selectedRecipe.calories}</p>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Protein</p>
                    <p className="text-xl font-bold text-foreground">{selectedRecipe.macros.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Carbs</p>
                    <p className="text-xl font-bold text-foreground">{selectedRecipe.macros.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Fats</p>
                    <p className="text-xl font-bold text-foreground">{selectedRecipe.macros.fats}g</p>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2 text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-ko-500 to-ko-600 mt-2 flex-shrink-0" />
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-ko-500 to-ko-600 flex items-center justify-center flex-shrink-0 text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tags */}
                {selectedRecipe.tags.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
