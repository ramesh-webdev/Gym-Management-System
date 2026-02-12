import { useState, useEffect, useCallback } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } from '@/api/diet-plans';
import { getMembers } from '@/api/members';
import type { DietPlan, Meal, Member } from '@/types';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

function DietPlanSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>

      <div className="mb-4 p-4 rounded-lg bg-muted/30 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-24 mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DietPlanManagement() {
  const confirmDialog = useConfirmDialog();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<DietPlan>>({});
  const [copyFromExisting, setCopyFromExisting] = useState(false);
  const [selectedPlanToCopy, setSelectedPlanToCopy] = useState<string>('');
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadDietPlans = useCallback(() => {
    setLoading(true);
    getDietPlans()
      .then(setDietPlans)
      .catch(() => {
        toast.error('Failed to load diet plans');
        setDietPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDietPlans();
    getMembers()
      .then((allMembers) => {
        setMembers(allMembers.filter((m) => m.hasPersonalTraining && m.status === 'active'));
      })
      .catch(() => {
        toast.error('Failed to load members');
        setMembers([]);
      });
  }, [loadDietPlans]);

  const filteredPlans = dietPlans.filter((plan) => {
    const member = members.find((m) => m.id === plan.memberId);
    const memberName = (plan as any).memberName || member?.name || '';
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const meals: Array<{ type: Meal['type']; foods: string[]; calories: number; time: string }> = [];
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((type) => {
      const foods = formData.get(`${type}_foods`) as string;
      const calories = formData.get(`${type}_calories`) as string;
      const time = formData.get(`${type}_time`) as string;

      if (foods && calories && time) {
        meals.push({
          type: type as Meal['type'],
          foods: foods.split(',').map((f) => f.trim()).filter(Boolean),
          calories: Number(calories),
          time: time,
        });
      }
    });

    setSaving(true);
    try {
      await createDietPlan({
        memberId: formData.get('memberId') as string,
        name: formData.get('name') as string,
        dailyCalories: Number(formData.get('dailyCalories')),
        macros: {
          protein: Number(formData.get('protein')),
          carbs: Number(formData.get('carbs')),
          fats: Number(formData.get('fats')),
        },
        meals,
      });
      toast.success('Diet plan created successfully');
      setIsAddDialogOpen(false);
      setCopyFromExisting(false);
      setSelectedPlanToCopy('');
      (e.target as HTMLFormElement).reset();
      loadDietPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create diet plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (plan: DietPlan) => {
    setCurrentPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan.id) return;
    const formData = new FormData(e.target as HTMLFormElement);

    const meals: Array<{ type: Meal['type']; foods: string[]; calories: number; time: string }> = [];
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((type) => {
      const foods = formData.get(`${type}_foods`) as string;
      const calories = formData.get(`${type}_calories`) as string;
      const time = formData.get(`${type}_time`) as string;

      if (foods && calories && time) {
        meals.push({
          type: type as Meal['type'],
          foods: foods.split(',').map((f) => f.trim()).filter(Boolean),
          calories: Number(calories),
          time: time,
        });
      }
    });

    setSaving(true);
    try {
      await updateDietPlan(currentPlan.id, {
        name: formData.get('name') as string,
        memberId: formData.get('memberId') as string,
        dailyCalories: Number(formData.get('dailyCalories')),
        macros: {
          protein: Number(formData.get('protein')),
          carbs: Number(formData.get('carbs')),
          fats: Number(formData.get('fats')),
        },
        meals,
      });
      toast.success('Diet plan updated successfully');
      setIsEditDialogOpen(false);
      loadDietPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update diet plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete diet plan',
      description: 'Are you sure you want to delete this diet plan?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteDietPlan(id);
      toast.success('Diet plan deleted successfully');
      loadDietPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete diet plan');
    }
  };

  const getMemberName = (plan: DietPlan) => {
    return (plan as any).memberName || members.find((m) => m.id === plan.memberId)?.name || 'Unknown';
  };

  const handleCopyPlanChange = (planId: string) => {
    setSelectedPlanToCopy(planId);
    if (planId && formRef) {
      const planToCopy = dietPlans.find((p) => p.id === planId);
      if (planToCopy) {
        const nameInput = formRef.querySelector('[name="name"]') as HTMLInputElement;
        const caloriesInput = formRef.querySelector('[name="dailyCalories"]') as HTMLInputElement;
        const proteinInput = formRef.querySelector('[name="protein"]') as HTMLInputElement;
        const carbsInput = formRef.querySelector('[name="carbs"]') as HTMLInputElement;
        const fatsInput = formRef.querySelector('[name="fats"]') as HTMLInputElement;

        if (nameInput) nameInput.value = planToCopy.name;
        if (caloriesInput) caloriesInput.value = String(planToCopy.dailyCalories);
        if (proteinInput) proteinInput.value = String(planToCopy.macros.protein);
        if (carbsInput) carbsInput.value = String(planToCopy.macros.carbs);
        if (fatsInput) fatsInput.value = String(planToCopy.macros.fats);

        planToCopy.meals.forEach((meal) => {
          const foodsInput = formRef.querySelector(`[name="${meal.type}_foods"]`) as HTMLInputElement;
          const caloriesMealInput = formRef.querySelector(`[name="${meal.type}_calories"]`) as HTMLInputElement;
          const timeInput = formRef.querySelector(`[name="${meal.type}_time"]`) as HTMLInputElement;

          if (foodsInput) foodsInput.value = meal.foods.join(', ');
          if (caloriesMealInput) caloriesMealInput.value = String(meal.calories);
          if (timeInput) timeInput.value = meal.time;
        });
      }
    }
  };

  const handleCopyToggle = (checked: boolean) => {
    setCopyFromExisting(checked);
    if (!checked) {
      setSelectedPlanToCopy('');
      if (formRef) {
        formRef.reset();
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Diet Plans</h1>
          <p className="text-muted-foreground">Create and manage personalized diet plans for members</p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setCopyFromExisting(false);
              setSelectedPlanToCopy('');
            }
          }}
        >
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
            <form
              ref={(el) => {
                if (el) setFormRef(el);
              }}
              onSubmit={handleAddPlan}
              className="space-y-4 pt-4"
            >
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="copy-from-existing"
                    checked={copyFromExisting}
                    onCheckedChange={handleCopyToggle}
                    className="border-border data-[state=checked]:bg-ko-500"
                  />
                  <label htmlFor="copy-from-existing" className="text-sm font-medium text-foreground cursor-pointer">
                    Copy from existing plan
                  </label>
                </div>
                {copyFromExisting && (
                  <div className="mt-3">
                    <label className="text-sm text-muted-foreground mb-2 block">Select plan to copy</label>
                    <select
                      value={selectedPlanToCopy}
                      onChange={(e) => handleCopyPlanChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                    >
                      <option value="">Select a plan...</option>
                      {dietPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {getMemberName(plan)}
                        </option>
                      ))}
                    </select>
                    {selectedPlanToCopy && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Plan data loaded. You can edit any fields before creating.
                      </p>
                    )}
                  </div>
                )}
              </div>
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
                    {members.map((member) => (
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
                disabled={saving || (copyFromExisting && !selectedPlanToCopy)}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                {saving ? 'Creating...' : 'Create Diet Plan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <DietPlanSkeleton key={i} />)}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          {dietPlans.length === 0 ? 'No diet plans yet. Create one to get started.' : 'No diet plans match your search.'}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {paginatedPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-xl bg-card/50 border border-border hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      Assigned to: <span className="text-foreground font-medium">{getMemberName(plan)}</span>
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPlans.length)} of {filteredPlans.length} plans
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

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
                    {members.map((member) => (
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
                disabled={saving}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                {saving ? 'Updating...' : 'Update Diet Plan'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
