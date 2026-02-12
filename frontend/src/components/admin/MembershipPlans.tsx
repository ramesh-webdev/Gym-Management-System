import { Plus, Edit, Trash2, Check, Star, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import { useEffect, useState } from 'react';

function PlanCardSkeleton() {
  return (
    <div className="relative p-6 rounded-xl border bg-card/50 border-border">
      <div className="absolute top-4 right-4"><Skeleton className="w-8 h-8 rounded-md" /></div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-baseline gap-2 mb-6">
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-border">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function MembershipPlans() {
  const confirmDialog = useConfirmDialog();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<MembershipPlan>>({});
  const [saving, setSaving] = useState(false);
  const [addFormIsAddOn, setAddFormIsAddOn] = useState(false);

  const existingAddOnPlan = plans.find((p) => p.isAddOn);

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
    const isAddOn = formData.get('isAddOn') === 'on';
    const duration = isAddOn ? 0 : Number(formData.get('duration') || 1);
    const featuresStr = (formData.get('features') as string) || '';
    const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
    const isActive = formData.get('isActive') === 'on';
    setSaving(true);
    try {
      await createMembershipPlan({ name, description, price, duration, features, isActive, isPopular: false, isAddOn });
      toast.success('Membership plan created successfully!');
      setIsAddDialogOpen(false);
      form.reset();
      loadPlans();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Could not create membership plan. Please try again.';
      toast.error(msg);
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
    const isAddOn = formData.get('isAddOn') === 'on';
    const duration = isAddOn ? 0 : Number(formData.get('duration') || 1);
    const featuresStr = (formData.get('features') as string) || '';
    const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
    const isActive = formData.get('isActive') === 'on';
    setSaving(true);
    try {
      await updateMembershipPlan(currentPlan.id, { name, description, price, duration, features, isActive, isAddOn });
      toast.success('Membership plan updated successfully!');
      setIsEditDialogOpen(false);
      loadPlans();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Could not update membership plan. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete plan',
      description: 'Are you sure you want to delete this plan?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteMembershipPlan(id);
      toast.success('Membership plan deleted successfully.');
      loadPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not delete membership plan.');
    }
  };

  const getDurationLabel = (duration: number, isAddOn?: boolean) => {
    if (isAddOn || duration === 0) return 'Add-on (not monthly)';
    if (duration === 1) return '/month';
    if (duration === 3) return '/quarter';
    if (duration === 6) return '/half-year';
    if (duration === 12) return '/year';
    return `/${duration}mo`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Membership Plans</h1>
          <p className="text-muted-foreground">Manage gym membership plans and pricing</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create monthly plans here. For add-ons like Personal Training, create a plan and check &quot;Add-on plan&quot; so it is not treated as a monthly membership.
          </p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setAddFormIsAddOn(false);
          }}
        >
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
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Checkbox
                  id="isAddOn"
                  name="isAddOn"
                  checked={addFormIsAddOn}
                  onCheckedChange={(v) => setAddFormIsAddOn(v === true)}
                />
                <label htmlFor="isAddOn" className="text-sm font-medium text-foreground cursor-pointer">
                  Add-on plan (e.g. Personal Training) – not a monthly membership. Members add it on top of their plan.
                </label>
              </div>
              {existingAddOnPlan && addFormIsAddOn && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                  <p className="font-medium">Only one add-on plan is allowed at a time.</p>
                  <p className="mt-1">An add-on plan already exists: &quot;{existingAddOnPlan.name}&quot;. Remove it or edit it instead of creating another.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setCurrentPlan(existingAddOnPlan);
                      setIsEditDialogOpen(true);
                      setAddFormIsAddOn(false);
                    }}
                  >
                    Edit existing add-on plan
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Price (₹)</label>
                  <Input name="price" type="number" required className="bg-muted/50 border-border text-foreground" placeholder="1000" />
                </div>
                <div id="duration-wrap-add">
                  <label className="text-sm text-muted-foreground mb-2 block">Duration (months)</label>
                  <Input name="duration" type="number" min={1} defaultValue={1} className="bg-muted/50 border-border text-foreground" placeholder="1" />
                  <p className="text-xs text-muted-foreground mt-1">N/A for add-on plans</p>
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
              <Button
                type="submit"
                disabled={saving || (addFormIsAddOn && !!existingAddOnPlan)}
                className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
              >
                {saving ? 'Creating...' : 'Create Plan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle className="font-display text-2xl">Edit Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePlan} className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0 pr-1">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Plan Name</label>
                <Input name="name" defaultValue={currentPlan.name} required className="bg-muted/50 border-border text-foreground" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Input name="description" defaultValue={currentPlan.description} required className="bg-muted/50 border-border text-foreground" />
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Checkbox id="edit-isAddOn" name="isAddOn" defaultChecked={currentPlan.isAddOn} />
                <label htmlFor="edit-isAddOn" className="text-sm font-medium text-foreground cursor-pointer">
                  Add-on plan (not a monthly membership)
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Price (₹)</label>
                  <Input name="price" type="number" defaultValue={currentPlan.price} required className="bg-muted/50 border-border text-foreground" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Duration (months)</label>
                  <Input name="duration" type="number" min={0} defaultValue={currentPlan.duration ?? 0} className="bg-muted/50 border-border text-foreground" />
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
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)
        ) : (
          plans.map((plan) => (
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
              {plan.isAddOn && (
                <div className="absolute -top-3 right-16">
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border border-amber-500/30">
                    Add-on
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
                <span className="text-muted-foreground">{getDurationLabel(plan.duration ?? 0, plan.isAddOn)}</span>
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
          ))
        )}
      </div>

      {plans.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No plans yet. Add one to get started.</p>
      )}
    </div>
  );
}
