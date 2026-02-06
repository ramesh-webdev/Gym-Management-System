import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Utensils,
  Apple,
  Droplets,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { mockMembers } from '@/data/mockData';
import { getAllDietPlans, saveDietPlan, deleteDietPlan as removeDietPlan } from '@/utils/dietPlanUtils';
import type { DietPlan, Meal } from '@/types';

export function DietPlanManagement() {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(getAllDietPlans());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<DietPlan>>({});

  const filteredPlans = dietPlans.filter((plan) => {
    const member = mockMembers.find((m) => m.id === plan.memberId);
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const meals: Meal[] = [];
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((type) => {
      const foods = formData.get(`${type}_foods`) as string;
      const calories = formData.get(`${type}_calories`) as string;
      const time = formData.get(`${type}_time`) as string;
      
      if (foods && calories && time) {
        meals.push({
          id: `meal_${Date.now()}_${type}`,
          type: type as Meal['type'],
          foods: foods.split(',').map((f) => f.trim()).filter(Boolean),
          calories: Number(calories),
          time: time,
        });
      }
    });

    const newPlan: DietPlan = {
      id: `dp${Date.now()}`,
      memberId: formData.get('memberId') as string,
      nutritionistId: 't4', // Default nutritionist
      name: formData.get('name') as string,
      dailyCalories: Number(formData.get('dailyCalories')),
      macros: {
        protein: Number(formData.get('protein')),
        carbs: Number(formData.get('carbs')),
        fats: Number(formData.get('fats')),
      },
      meals: meals,
    };

    saveDietPlan(newPlan);
    setDietPlans(getAllDietPlans());
    setIsAddDialogOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleEditClick = (plan: DietPlan) => {
    setCurrentPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const meals: Meal[] = [];
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((type) => {
      const foods = formData.get(`${type}_foods`) as string;
      const calories = formData.get(`${type}_calories`) as string;
      const time = formData.get(`${type}_time`) as string;
      
      if (foods && calories && time) {
        meals.push({
          id: currentPlan.meals?.find(m => m.type === type)?.id || `meal_${Date.now()}_${type}`,
          type: type as Meal['type'],
          foods: foods.split(',').map((f) => f.trim()).filter(Boolean),
          calories: Number(calories),
          time: time,
        });
      }
    });

    const updatedPlan: DietPlan = {
      ...currentPlan as DietPlan,
      name: formData.get('name') as string,
      memberId: formData.get('memberId') as string,
      dailyCalories: Number(formData.get('dailyCalories')),
      macros: {
        protein: Number(formData.get('protein')),
        carbs: Number(formData.get('carbs')),
        fats: Number(formData.get('fats')),
      },
      meals: meals,
    };
    
    saveDietPlan(updatedPlan);
    setDietPlans(getAllDietPlans());
    setIsEditDialogOpen(false);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this diet plan?')) {
      removeDietPlan(id);
      setDietPlans(getAllDietPlans());
    }
  };

  const getMemberName = (memberId: string) => {
    return mockMembers.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  const membersWithPT = mockMembers.filter((m) => m.hasPersonalTraining);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Diet Plans</h1>
          <p className="text-muted-foreground">Create and manage personalized diet plans for members</p>
        </div>

        {/* Add Plan Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Diet Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Create New Diet Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPlan} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Plan Name</label>
                  <Input
                    name="name"
                    required
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="e.g., Lean Muscle Nutrition"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Assign to Member</label>
                  <select
                    name="memberId"
                    required
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                  >
                    <option value="">Select member...</option>
                    {membersWithPT.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Daily Calories</label>
                <Input
                  name="dailyCalories"
                  type="number"
                  required
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="2200"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Daily Macros</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Protein (g)</label>
                    <Input
                      name="protein"
                      type="number"
                      required
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="165"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Carbs (g)</label>
                    <Input
                      name="carbs"
                      type="number"
                      required
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="220"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fats (g)</label>
                    <Input
                      name="fats"
                      type="number"
                      required
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="73"
                    />
                  </div>
                </div>
              </div>

              {/* Meals Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-display text-lg font-bold text-foreground">Meals</h3>
                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                  <div key={mealType} className="p-4 rounded-lg bg-muted/30 border border-border">
                    <h4 className="font-medium text-foreground mb-3 capitalize">{mealType}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground mb-1 block">Foods (comma-separated)</label>
                        <Input
                          name={`${mealType}_foods`}
                          className="bg-muted/50 border-border text-foreground"
                          placeholder="e.g., Oatmeal, Banana, Almonds"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Calories</label>
                        <Input
                          name={`${mealType}_calories`}
                          type="number"
                          className="bg-muted/50 border-border text-foreground"
                          placeholder="550"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                        <Input
                          name={`${mealType}_time`}
                          className="bg-muted/50 border-border text-foreground"
                          placeholder="7:00 AM"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                Create Diet Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search diet plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
        />
      </div>

      {/* Diet Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredPlans.map((plan) => {
          return (
            <div
              key={plan.id}
              className="p-6 rounded-xl bg-card/50 border border-border hover:border-border transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    Assigned to: <span className="text-foreground font-medium">{getMemberName(plan.memberId)}</span>
                  </p>
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
                      onClick={() => handleEditClick(plan)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Calories & Macros */}
              <div className="mb-4 p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-ko-500" />
                  <span className="font-display text-2xl font-bold text-foreground">
                    {plan.dailyCalories}
                  </span>
                  <span className="text-muted-foreground text-sm">kcal/day</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Apple className="w-4 h-4 text-ko-500" />
                      <span className="text-xs text-muted-foreground">Protein</span>
                    </div>
                    <p className="font-medium text-foreground">{plan.macros.protein}g</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Utensils className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Carbs</span>
                    </div>
                    <p className="font-medium text-foreground">{plan.macros.carbs}g</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Droplets className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Fats</span>
                    </div>
                    <p className="font-medium text-foreground">{plan.macros.fats}g</p>
                  </div>
                </div>
              </div>

              {/* Meals Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground mb-2">Meals ({plan.meals.length})</h4>
                {plan.meals.slice(0, 3).map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{meal.type}</span>
                    <span className="text-foreground">{meal.time} • {meal.calories} kcal</span>
                  </div>
                ))}
                {plan.meals.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{plan.meals.length - 3} more meals</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit Diet Plan</DialogTitle>
          </DialogHeader>
          {currentPlan.id && (
            <form onSubmit={handleUpdatePlan} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Plan Name</label>
                  <Input
                    name="name"
                    required
                    defaultValue={currentPlan.name}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Assign to Member</label>
                  <select
                    name="memberId"
                    required
                    defaultValue={currentPlan.memberId}
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                  >
                    {membersWithPT.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Daily Calories</label>
                <Input
                  name="dailyCalories"
                  type="number"
                  required
                  defaultValue={currentPlan.dailyCalories}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Daily Macros</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Protein (g)</label>
                    <Input
                      name="protein"
                      type="number"
                      required
                      defaultValue={currentPlan.macros?.protein}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Carbs (g)</label>
                    <Input
                      name="carbs"
                      type="number"
                      required
                      defaultValue={currentPlan.macros?.carbs}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fats (g)</label>
                    <Input
                      name="fats"
                      type="number"
                      required
                      defaultValue={currentPlan.macros?.fats}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Meals Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-display text-lg font-bold text-foreground">Meals</h3>
                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                  const existingMeal = currentPlan.meals?.find((m) => m.type === mealType);
                  return (
                    <div key={mealType} className="p-4 rounded-lg bg-muted/30 border border-border">
                      <h4 className="font-medium text-foreground mb-3 capitalize">{mealType}</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground mb-1 block">Foods (comma-separated)</label>
                          <Input
                            name={`${mealType}_foods`}
                            defaultValue={existingMeal?.foods.join(', ')}
                            className="bg-muted/50 border-border text-foreground"
                            placeholder="e.g., Oatmeal, Banana, Almonds"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Calories</label>
                          <Input
                            name={`${mealType}_calories`}
                            type="number"
                            defaultValue={existingMeal?.calories}
                            className="bg-muted/50 border-border text-foreground"
                            placeholder="550"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                          <Input
                            name={`${mealType}_time`}
                            defaultValue={existingMeal?.time}
                            className="bg-muted/50 border-border text-foreground"
                            placeholder="7:00 AM"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                Update Diet Plan
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
