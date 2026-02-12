import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Apple,
  Flame,
  Droplets,
  ChevronRight,
  Info,
  Utensils,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getMyDietPlan } from '@/api/diet-plans';
import { getStoredUser } from '@/api/auth';
import { toast } from 'sonner';
import type { DietPlan, User } from '@/types';

export function MemberDiet() {
  const navigate = useNavigate();
  const [activeMeal, setActiveMeal] = useState<string | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (!currentUser || currentUser.role !== 'member') {
      navigate('/member/dashboard');
      return;
    }

    if (!currentUser.hasPersonalTraining) {
      navigate('/member/dashboard');
      return;
    }

    // Load diet plan
    setLoading(true);
    getMyDietPlan()
      .then(setDietPlan)
      .catch((err) => {
        if (err && typeof err === 'object' && 'status' in err && (err as any).status === 404) {
          // No diet plan assigned - this is OK, show message
          setDietPlan(null);
        } else {
          toast.error('Failed to load diet plan');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Don't render if no access
  if (!user || !user.hasPersonalTraining) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-48 flex flex-col items-center">
              <Skeleton className="w-32 h-32 rounded-full" />
              <Skeleton className="h-4 w-24 mt-4" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="w-5 h-5 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show message if no diet plan assigned
  if (!dietPlan) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-full bg-ko-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-ko-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            No Diet Plan Assigned
          </h2>
          <p className="text-muted-foreground max-w-md">
            Your personalized diet plan hasn't been created yet. Please contact your trainer or admin to get your diet plan assigned.
          </p>
        </div>
      </div>
    );
  }

  const mealIcons: Record<string, typeof Apple> = {
    breakfast: Apple,
    lunch: Utensils,
    dinner: Utensils,
    snack: Apple,
  };

  const mealColors: Record<string, string> = {
    breakfast: 'bg-orange-500/20 text-orange-500',
    lunch: 'bg-blue-500/20 text-blue-500',
    dinner: 'bg-purple-500/20 text-purple-500',
    snack: 'bg-green-500/20 text-green-500',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Diet Plan</h1>
          <p className="text-muted-foreground">{dietPlan.name}</p>
        </div>
        <Button variant="outline" className="border-border text-foreground hover:bg-muted/50">
          <Info className="w-4 h-4 mr-2" />
          Nutrition Guide
        </Button>
      </div>

      {/* Macros Overview */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Daily Calories */}
          <div className="lg:w-48 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#FF6B00"
                  strokeWidth="3"
                  strokeDasharray="65, 100"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-6 h-6 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent mb-1" />
                <span className="font-display text-2xl font-bold text-foreground">
                  {dietPlan.dailyCalories}
                </span>
                <span className="text-muted-foreground text-xs">kcal</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">Daily Target</p>
          </div>

          {/* Macros Breakdown */}
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Daily Macros</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Protein', value: dietPlan.macros.protein, unit: 'g', color: 'bg-ko-500', icon: Apple },
                { label: 'Carbs', value: dietPlan.macros.carbs, unit: 'g', color: 'bg-blue-500', icon: Utensils },
                { label: 'Fats', value: dietPlan.macros.fats, unit: 'g', color: 'bg-orange-500', icon: Droplets },
              ].map((macro, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${macro.color}/20 flex items-center justify-center`}>
                      <macro.icon className={`w-4 h-4 ${macro.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-muted-foreground text-sm">{macro.label}</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {macro.value}
                    <span className="text-muted-foreground text-lg ml-1">{macro.unit}</span>
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${macro.color}`} style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-foreground">Today's Meals</h3>

        {dietPlan.meals.map((meal) => {
          const Icon = mealIcons[meal.type] || Apple;
          const colorClass = mealColors[meal.type] || 'bg-muted/50 text-foreground';
          const isExpanded = activeMeal === meal.id;

          return (
            <div
              key={meal.id}
              className={`p-5 rounded-xl border transition-all ${isExpanded
                  ? 'bg-ko-500/5 border-ko-500/20'
                  : 'bg-card/50 border-border hover:border-border'
                }`}
            >
              <button
                onClick={() => setActiveMeal(isExpanded ? null : meal.id)}
                className="w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-display text-lg font-bold text-foreground capitalize">
                        {meal.type}
                      </h4>
                      <p className="text-muted-foreground text-sm">{meal.time} • {meal.calories} kcal</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''
                    }`} />
                </div>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border animate-slide-up">
                  <h5 className="text-muted-foreground text-sm mb-3">Foods:</h5>
                  <ul className="space-y-2">
                    {meal.foods.map((food, index) => (
                      <li key={index} className="flex items-center gap-2 text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-ko-500 to-ko-600" />
                        {food}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total Calories</span>
                    <span className="font-display text-xl font-bold bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
                      {meal.calories} kcal
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nutrition Tips */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">Nutrition Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Eat protein with every meal to support muscle growth',
            'Stay hydrated - drink at least 8 glasses of water daily',
            'Eat whole foods over processed foods when possible',
            'Time your carbs around your workouts for optimal energy',
            'Include healthy fats for hormone production',
            'Prep meals in advance to stay on track',
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-ko-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
