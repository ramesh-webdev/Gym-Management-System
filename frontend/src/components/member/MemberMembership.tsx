import { useState } from 'react';
import {
  CreditCard,
  Check,
  Calendar,
  Clock,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockMembers, mockMembershipPlans } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function MemberMembership() {
  const member = mockMembers[0];
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const daysUntilExpiry = Math.ceil(
    (new Date(member.membershipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentPlan = mockMembershipPlans.find(p => p.name === member.membershipType);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">My Membership</h1>
        <p className="text-muted-foreground">Manage your membership plan and benefits</p>
      </div>

      {/* Current Plan Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-lime-500/20 to-lime-500/5 border border-lime-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-lime-500 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lime-500 text-sm font-medium">Current Plan</p>
                <h2 className="font-display text-3xl font-bold text-foreground">{member.membershipType}</h2>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Started {member.joinDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Expires {member.membershipExpiry.toLocaleDateString()}</span>
              </div>
            </div>
            
            <p className="text-muted-foreground max-w-lg">{currentPlan?.description}</p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="text-left lg:text-right">
              <p className="text-muted-foreground text-sm mb-1">Days Remaining</p>
              <p className={`font-display text-5xl font-bold ${daysUntilExpiry < 30 ? 'text-red-400' : 'text-lime-500'}`}>
                {daysUntilExpiry}
              </p>
            </div>
            
            {daysUntilExpiry < 30 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Expiring soon - Renew now!
              </div>
            )}
            
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Upgrade Your Plan</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 pt-4">
                  {mockMembershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border ${
                        plan.name === member.membershipType
                          ? 'bg-lime-500/10 border-lime-500/30'
                          : 'bg-muted/50 border-border hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-xl font-bold text-foreground">{plan.name}</h4>
                            {plan.name === member.membershipType && (
                              <span className="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-500 text-xs">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-lime-500">${plan.price}</p>
                          <p className="text-muted-foreground text-sm">/month</p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Check className="w-4 h-4 text-lime-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {plan.name !== member.membershipType && (
                        <Button className="w-full mt-4 bg-lime-500 text-primary-foreground hover:bg-lime-400">
                          Switch to {plan.name}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div>
        <h3 className="font-display text-xl font-bold text-foreground mb-4">Your Benefits</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPlan?.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-lime-500" />
              </div>
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Membership History */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">Membership History</h3>
        <div className="space-y-3">
          {[
            { date: member.joinDate, action: 'Membership Started', plan: member.membershipType },
            { date: new Date('2023-06-15'), action: 'Plan Upgraded', plan: 'Basic to Pro' },
            { date: new Date('2023-03-15'), action: 'Account Created', plan: '-' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-lime-500" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium">{item.action}</p>
                <p className="text-muted-foreground text-sm">{item.date.toLocaleDateString()}</p>
              </div>
              {item.plan !== '-' && (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                  {item.plan}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
