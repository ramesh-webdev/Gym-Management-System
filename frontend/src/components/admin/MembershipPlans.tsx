import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, Star, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import {
  getMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
} from '@/api/membership-plans';
import type { MembershipPlan } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export function MembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<MembershipPlan>>({});
  const [saving, setSaving] = useState(false);

  const loadPlans = () => {
    setLoading(true);
    getMembershipPlans()
      .then(setPlans)
      .catch(() => {
        toast.error('Failed to load plans');
        setPlans([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price'));
    const duration = Number(formData.get('duration'));
    const featuresStr = (formData.get('features') as string) || '';
    const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
    const isActive = formData.get('isActive') === 'on';
    setSaving(true);
    try {
      await createMembershipPlan({ name, description, price, duration, features, isActive, isPopular: false });
      toast.success('Plan created');
      setIsAddDialogOpen(false);
      form.reset();
      loadPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (plan: MembershipPlan) => {
    setCurrentPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan.id) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price'));
    const duration = Number(formData.get('duration'));
    const featuresStr = (formData.get('features') as string) || '';
    const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
    const isActive = formData.get('isActive') === 'on';
    setSaving(true);
    try {
      await updateMembershipPlan(currentPlan.id, { name, description, price, duration, features, isActive });
      toast.success('Plan updated');
      setIsEditDialogOpen(false);
      loadPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deleteMembershipPlan(id);
      toast.success('Plan deleted');
      loadPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete plan');
    }
  };

  const getDurationLabel = (duration: number) => {
    if (duration === 1) return '/month';
    if (duration === 3) return '/quarter';
    if (duration === 6) return '/half-year';
    if (duration === 12) return '/year';
    return `/${duration}mo`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Membership Plans</h1>
          <p className="text-muted-foreground">Manage gym membership plans and pricing</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add New Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPlan} className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Plan Name</label>
                <Input name="name" required className="bg-muted/50 border-border text-foreground" placeholder="e.g. Premium" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Input name="description" required className="bg-muted/50 border-border text-foreground" placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Price (₹)</label>
                  <Input name="price" type="number" required className="bg-muted/50 border-border text-foreground" placeholder="1000" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Duration (months)</label>
                  <Input name="duration" type="number" required className="bg-muted/50 border-border text-foreground" placeholder="1" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Features (comma separated)</label>
                <Input name="features" required className="bg-muted/50 border-border text-foreground" placeholder="Gym access, Classes, ..." />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isActive" name="isActive" defaultChecked />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                >
                  Active
                </label>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                {saving ? 'Creating...' : 'Create Plan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Edit Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePlan} className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Plan Name</label>
                <Input name="name" defaultValue={currentPlan.name} required className="bg-muted/50 border-border text-foreground" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Input name="description" defaultValue={currentPlan.description} required className="bg-muted/50 border-border text-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Price (₹)</label>
                  <Input name="price" type="number" defaultValue={currentPlan.price} required className="bg-muted/50 border-border text-foreground" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Duration (months)</label>
                  <Input name="duration" type="number" defaultValue={currentPlan.duration} required className="bg-muted/50 border-border text-foreground" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Features (comma separated)</label>
                <Input name="features" defaultValue={currentPlan.features?.join(', ')} required className="bg-muted/50 border-border text-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="edit-isActive" name="isActive" defaultChecked={currentPlan.isActive} />
                <label
                  htmlFor="edit-isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                >
                  Active
                </label>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                {saving ? 'Updating...' : 'Update Plan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-xl border transition-colors ${plan.isPopular
              ? 'bg-lime-500/5 border-lime-500/30'
              : 'bg-card/50 border-border hover:border-border'
              }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-6">
                <Badge className="bg-lime-500 text-primary-foreground">
                  <Star className="w-3 h-3 mr-1 fill-primary-foreground" />
                  Popular
                </Badge>
              </div>
            )}

            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem
                    onClick={() => handleEditClick(plan)}
                    className="text-foreground hover:bg-muted/50 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm min-h-[40px]">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-5xl font-bold text-lime-500">
                ₹{plan.price}
              </span>
              <span className="text-muted-foreground">{getDurationLabel(plan.duration)}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {(plan.features || []).map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-lime-500" />
                  </div>
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border">
              <Badge
                className={
                  plan.isActive
                    ? 'bg-lime-500/20 text-lime-500'
                    : 'bg-red-500/20 text-red-500'
                }
              >
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No plans yet. Add one to get started.</p>
      )}
    </div>
  );
}
