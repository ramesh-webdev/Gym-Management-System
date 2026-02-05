import { useState } from 'react';
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
import { mockMembershipPlans } from '@/data/mockData';

export function MembershipPlans() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [plans] = useState(mockMembershipPlans);

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
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Plan Name</label>
                <Input className="bg-muted/50 border-border text-foreground" placeholder="e.g. Premium" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Input className="bg-muted/50 border-border text-foreground" placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Price ($)</label>
                  <Input type="number" className="bg-muted/50 border-border text-foreground" placeholder="49" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Duration (months)</label>
                  <Input type="number" className="bg-muted/50 border-border text-foreground" placeholder="1" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Features (comma separated)</label>
                <Input className="bg-muted/50 border-border text-foreground" placeholder="Gym access, Classes, ..." />
              </div>
              <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-xl border transition-colors ${
              plan.isPopular
                ? 'bg-lime-500/5 border-lime-500/30'
                : 'bg-card/50 border-border hover:border-border'
            }`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-6">
                <Badge className="bg-lime-500 text-primary-foreground">
                  <Star className="w-3 h-3 mr-1 fill-primary-foreground" />
                  Popular
                </Badge>
              </div>
            )}

            {/* Actions */}
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-muted/50 cursor-pointer">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Plan Header */}
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-display text-5xl font-bold text-lime-500">
                ${plan.price}
              </span>
              <span className="text-muted-foreground">/{plan.duration}mo</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-lime-500" />
                  </div>
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Status */}
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
    </div>
  );
}
