import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Check,
  Calendar,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowLeft,
  Lock,
  CheckCircle,
  Dumbbell,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { fetchMe } from '@/api/auth';
import { getMembershipPlans } from '@/api/membership-plans';
import { getSettings } from '@/api/settings';
import { createOrder, verifyPayment } from '@/api/payments';
import type { User } from '@/types';
import type { MembershipPlan } from '@/types';
import { formatDate } from '@/utils/date';
import { toast } from 'sonner';

const USER_KEY = 'user';

type PayStep = 'plans' | 'personal_training' | 'checkout' | 'success';

export function MemberMembership() {
  const [member, setMember] = useState<User | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [personalTrainingPrice, setPersonalTrainingPrice] = useState(500);
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAddPTDialog, setShowAddPTDialog] = useState(false);

  // Payment flow state (plan + optional PT)
  const [step, setStep] = useState<PayStep>('plans');
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [addPersonalTraining, setAddPersonalTraining] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAmountRupees, setOrderAmountRupees] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Add PT only flow (ongoing membership)
  const [addPTOrderId, setAddPTOrderId] = useState<string | null>(null);
  const [addPTAmount, setAddPTAmount] = useState(0);
  const [addPTStep, setAddPTStep] = useState<'confirm' | 'checkout' | 'success'>('confirm');
  const [addPTSubmitting, setAddPTSubmitting] = useState(false);
  const [addPTError, setAddPTError] = useState<string | null>(null);

  const loadMember = useCallback(async () => {
    try {
      const user = await fetchMe();
      setMember(user);
      if (user && (user as any).membershipExpiry) {
        const stored = { ...user };
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(stored));
        } catch {
          // ignore
        }
      }
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  useEffect(() => {
    getMembershipPlans()
      .then((list) => setPlans((list || []).filter((p) => p.isActive !== false)))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    getSettings()
      .then((s) => setPersonalTrainingPrice(s.personalTrainingPrice ?? 500))
      .catch(() => setPersonalTrainingPrice(500));
  }, []);

  const membershipExpiry = member && (member as any).membershipExpiry
    ? new Date((member as any).membershipExpiry)
    : null;
  const joinDate = member && (member as any).joinDate
    ? new Date((member as any).joinDate)
    : null;
  const membershipType = (member as any)?.membershipType ?? '';
  const membershipId = (member as any)?.membershipId ?? '';

  const daysUntilExpiry =
    membershipExpiry != null
      ? Math.ceil(
        (membershipExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      : null;

  const monthlyPlans = plans.filter((p) => !p.isAddOn);
  const addOnPlans = plans.filter((p) => p.isAddOn);
  const ptAddOnPlan = addOnPlans[0]; // e.g. Personal Training – use first add-on plan
  const ptPrice = ptAddOnPlan ? ptAddOnPlan.price : personalTrainingPrice;

  const currentPlan = plans.find(
    (p) => p.name === membershipType || p.id === (member as any)?.membershipPlan
  );

  const hasActiveMembership =
    currentPlan &&
    membershipExpiry != null &&
    daysUntilExpiry != null &&
    daysUntilExpiry > 0;

  const handleOpenUpgradeDialog = (open: boolean) => {
    setShowUpgradeDialog(open);
    if (!open) {
      setStep('plans');
      setSelectedPlan(null);
      setAddPersonalTraining(false);
      setOrderId(null);
      setOrderAmountRupees(0);
      setVerifyError(null);
    }
  };

  const handleSelectPlanToPay = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setVerifyError(null);
  };

  const goToPayOrPTStep = () => {
    if (!selectedPlan) return;
    setVerifyError(null);
    setStep('personal_training');
  };

  const handleProceedToPay = async () => {
    if (!selectedPlan || selectedPlan.price <= 0) return;
    const total = selectedPlan.price + (addPersonalTraining ? ptPrice : 0);
    setSubmitting(true);
    setVerifyError(null);
    try {
      const body: { amount: number; type: 'membership'; membershipPlanId?: string; addPersonalTraining?: boolean } = {
        amount: total,
        type: 'membership',
        addPersonalTraining: addPersonalTraining || undefined,
      };
      if (selectedPlan.id !== (member as any)?.membershipPlan && selectedPlan.name !== membershipType) {
        body.membershipPlanId = selectedPlan.id;
      }
      const res = await createOrder(body);
      setOrderId(res.orderId);
      setOrderAmountRupees(res.amount / 100);
      setStep('checkout');
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPay = async () => {
    if (!orderId) return;
    setSubmitting(true);
    setVerifyError(null);
    try {
      await verifyPayment({
        orderId,
        razorpayPaymentId: `auto_${orderId}`,
        razorpaySignature: 'auto_approved',
      });
      setStep('success');
      toast.success('Payment successful! Your membership has been updated.');
      await loadMember();
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPT = (member as any)?.hasPersonalTraining === true;

  const handleAddPTPay = async () => {
    setAddPTSubmitting(true);
    setAddPTError(null);
    try {
      if (ptAddOnPlan) {
        const res = await createOrder({ amount: ptAddOnPlan.price, type: 'membership', membershipPlanId: ptAddOnPlan.id });
        setAddPTOrderId(res.orderId);
        setAddPTAmount(res.amount / 100);
      } else {
        const res = await createOrder({ amount: ptPrice, type: 'personal_training' });
        setAddPTOrderId(res.orderId);
        setAddPTAmount(res.amount / 100);
      }
      setAddPTStep('checkout');
    } catch (e) {
      setAddPTError(e instanceof Error ? e.message : 'Failed to create order');
    } finally {
      setAddPTSubmitting(false);
    }
  };

  const handleAddPTConfirmPay = async () => {
    if (!addPTOrderId) return;
    setAddPTSubmitting(true);
    setAddPTError(null);
    try {
      await verifyPayment({
        orderId: addPTOrderId,
        razorpayPaymentId: `auto_${addPTOrderId}`,
        razorpaySignature: 'auto_approved',
      });
      setAddPTStep('success');
      toast.success('Personal training added to your membership!');
      await loadMember();
    } catch (e) {
      setAddPTError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setAddPTSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="p-8 rounded-2xl bg-card/50 border border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-14 w-24" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-card/50 border border-border flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-card/50 border border-border space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <p className="text-red-500">Could not load your profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">My Membership</h1>
        <p className="text-muted-foreground">Manage your membership plan and benefits</p>
      </div>

      {/* No active membership – choose a plan */}
      {!hasActiveMembership && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                No active membership
              </h2>
              <p className="text-muted-foreground mt-1">
                {!currentPlan && !membershipType
                  ? 'Choose a plan below to get access to the gym and benefits.'
                  : membershipExpiry && daysUntilExpiry != null && daysUntilExpiry <= 0
                    ? 'Your membership has expired. Renew or choose a plan to continue.'
                    : 'Choose a plan to activate your membership.'}
              </p>
            </div>
            <Button
              className="bg-lime-500 text-primary-foreground hover:bg-lime-400 shrink-0"
              onClick={() => setShowUpgradeDialog(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Choose a plan
            </Button>
          </div>
        </div>
      )}

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
                <h2 className="font-display text-3xl font-bold text-foreground">
                  {currentPlan?.name ?? membershipType ?? 'No plan'}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              {membershipId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>ID: {membershipId}</span>
                </div>
              )}
              {joinDate && membershipExpiry && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Period: {formatDate(joinDate)} – {formatDate(membershipExpiry)}
                  </span>
                </div>
              )}
              {!joinDate && membershipExpiry && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Valid until {formatDate(membershipExpiry)}</span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground max-w-lg">
              {currentPlan?.description ?? 'Renew or upgrade your plan below.'}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4">
            {daysUntilExpiry != null && (
              <div className="text-left lg:text-right">
                <p className="text-muted-foreground text-sm mb-1">Days Remaining</p>
                <p
                  className={`font-display text-5xl font-bold ${daysUntilExpiry < 30 ? 'text-red-400' : 'text-lime-500'
                    }`}
                >
                  {daysUntilExpiry}
                </p>
              </div>
            )}

            {daysUntilExpiry != null && daysUntilExpiry < 30 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Expiring soon — Renew now!
              </div>
            )}

            <Dialog open={showUpgradeDialog} onOpenChange={handleOpenUpgradeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {currentPlan ? 'Renew / Upgrade Plan' : 'Choose a Plan'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">
                    {step === 'plans' && 'Renew or upgrade your plan'}
                    {step === 'personal_training' && 'Personal training add-on'}
                    {step === 'checkout' && 'Confirm Payment'}
                    {step === 'success' && 'Payment Successful'}
                  </DialogTitle>
                </DialogHeader>

                {step === 'plans' && (
                  <div className="grid gap-4 pt-4">
                    {monthlyPlans.length === 0 ? (
                      <p className="text-muted-foreground py-4">No monthly plans available.</p>
                    ) : (
                      monthlyPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-4 rounded-xl border ${selectedPlan?.id === plan.id
                              ? 'bg-lime-500/10 border-lime-500/30'
                              : 'bg-muted/50 border-border hover:border-border'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display text-xl font-bold text-foreground">
                                  {plan.name}
                                </h4>
                                {plan.name === membershipType && (
                                  <span className="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-500 text-xs">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mt-1">
                                {plan.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-2xl font-bold text-lime-500">
                                ₹{plan.price.toLocaleString()}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                / {plan.duration ? `${plan.duration} month${plan.duration !== 1 ? 's' : ''}` : 'add-on'}
                              </p>
                            </div>
                          </div>
                          <ul className="mt-4 space-y-2">
                            {(plan.features || []).map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-muted-foreground text-sm"
                              >
                                <Check className="w-4 h-4 text-lime-500 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
                            className={`w-full mt-4 ${selectedPlan?.id === plan.id
                                ? 'bg-lime-500 text-primary-foreground hover:bg-lime-400'
                                : 'border-border text-foreground'
                              }`}
                            onClick={() => handleSelectPlanToPay(plan)}
                          >
                            {plan.name === membershipType
                              ? 'Renew this plan'
                              : !currentPlan && !membershipType
                                ? 'Get this plan'
                                : `Switch to ${plan.name}`}
                          </Button>
                        </div>
                      ))
                    )}
                    {selectedPlan && (
                      <div className="pt-2 border-t border-border flex gap-2">
                        <Button
                          className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                          onClick={goToPayOrPTStep}
                        >
                          Next: Personal training
                        </Button>
                      </div>
                    )}
                    {verifyError && (
                      <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                        {verifyError}
                      </p>
                    )}
                  </div>
                )}

                {step === 'personal_training' && selectedPlan && (
                  <div className="space-y-4 pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground -mt-2"
                      onClick={() => setStep('plans')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to plans
                    </Button>
                    <p className="text-muted-foreground">
                      Personal training is an add-on to your membership (diet plans, trainer support). It is not part of any plan and stays with your account.
                    </p>
                    <p className="font-medium text-foreground">Do you need personal training?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAddPersonalTraining(true)}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${addPersonalTraining ? 'border-lime-500 bg-lime-500/10' : 'border-border hover:bg-muted/50'
                          }`}
                      >
                        <Dumbbell className="w-6 h-6 text-lime-500 mb-2" />
                        <p className="font-medium text-foreground">Yes, add personal training</p>
                        <p className="text-sm text-muted-foreground">+ ₹{ptPrice.toLocaleString()}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddPersonalTraining(false)}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${!addPersonalTraining ? 'border-lime-500 bg-lime-500/10' : 'border-border hover:bg-muted/50'
                          }`}
                      >
                        <Check className="w-6 h-6 text-muted-foreground mb-2" />
                        <p className="font-medium text-foreground">No, just the plan</p>
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-muted-foreground text-sm">Summary</p>
                      <p className="font-medium text-foreground">{selectedPlan.name}: ₹{selectedPlan.price.toLocaleString()}</p>
                      {addPersonalTraining && (
                        <p className="font-medium text-foreground mt-1">Personal training add-on: ₹{ptPrice.toLocaleString()}</p>
                      )}
                      <p className="font-display text-xl font-bold text-foreground mt-2">
                        Total: ₹{(selectedPlan.price + (addPersonalTraining ? ptPrice : 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 border-border" onClick={() => setStep('plans')}>
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                        disabled={submitting}
                        onClick={handleProceedToPay}
                      >
                        {submitting ? 'Creating order...' : 'Proceed to Pay'}
                      </Button>
                    </div>
                    {verifyError && (
                      <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{verifyError}</p>
                    )}
                  </div>
                )}

                {step === 'checkout' && selectedPlan && (
                  <div className="space-y-4 pt-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-muted-foreground text-sm">{selectedPlan.name}</p>
                      <p className="font-display text-2xl font-bold text-foreground mt-1">
                        ₹{orderAmountRupees.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {selectedPlan.duration} month{selectedPlan.duration !== 1 ? 's' : ''} membership
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Secure payment (auto-approved in test mode)
                    </p>
                    {verifyError && (
                      <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                        {verifyError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-border text-foreground"
                        onClick={() => setStep('plans')}
                        disabled={submitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                        disabled={submitting}
                        onClick={handleConfirmPay}
                      >
                        {submitting ? 'Processing...' : `Pay ₹${orderAmountRupees.toLocaleString()}`}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="space-y-4 pt-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-lime-500" />
                    </div>
                    <p className="text-foreground font-medium">
                      Your payment of ₹{orderAmountRupees.toLocaleString()} was successful.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Your membership has been updated. Invoice is in your payment history.
                    </p>
                    <Button
                      className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
                      onClick={() => handleOpenUpgradeDialog(false)}
                    >
                      Done
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Add personal training (ongoing membership, no PT yet) */}
      {hasActiveMembership && !hasPT && (
        <div className="p-6 rounded-2xl bg-muted/50 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-lime-500" />
                Add personal training
              </h3>
              <p className="text-muted-foreground mt-1">
                Get diet plans and trainer support. Personal training is an add-on to your membership, not part of any plan.
              </p>
            </div>
            <Button
              className="bg-lime-500 text-primary-foreground hover:bg-lime-400 shrink-0"
              onClick={() => {
                setShowAddPTDialog(true);
                setAddPTStep('confirm');
                setAddPTOrderId(null);
                setAddPTError(null);
              }}
            >
              Add for ₹{personalTrainingPrice.toLocaleString()}
            </Button>
          </div>
        </div>
      )}

      {/* Add PT dialog */}
      <Dialog open={showAddPTDialog} onOpenChange={setShowAddPTDialog}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              {addPTStep === 'confirm' && 'Add personal training'}
              {addPTStep === 'checkout' && 'Confirm payment'}
              {addPTStep === 'success' && 'Done'}
            </DialogTitle>
          </DialogHeader>
          {addPTStep === 'confirm' && (
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground text-sm">
                {ptAddOnPlan?.description || 'One-time add-on. You will get access to diet plans and trainer support.'} ₹{ptPrice.toLocaleString()}.
              </p>
              {addPTError && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{addPTError}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddPTDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                  disabled={addPTSubmitting}
                  onClick={handleAddPTPay}
                >
                  {addPTSubmitting ? 'Creating order...' : `Pay ₹${ptPrice.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
          {addPTStep === 'checkout' && (
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-muted-foreground text-sm">Personal training add-on</p>
                <p className="font-display text-2xl font-bold text-foreground mt-1">₹{addPTAmount.toLocaleString()}</p>
              </div>
              {addPTError && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{addPTError}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setAddPTStep('confirm')} disabled={addPTSubmitting}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                  disabled={addPTSubmitting}
                  onClick={handleAddPTConfirmPay}
                >
                  {addPTSubmitting ? 'Processing...' : `Pay ₹${addPTAmount.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
          {addPTStep === 'success' && (
            <div className="space-y-4 pt-4 text-center">
              <div className="w-14 h-14 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-lime-500" />
              </div>
              <p className="text-foreground font-medium">Personal training has been added to your membership.</p>
              <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400" onClick={() => setShowAddPTDialog(false)}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Benefits Grid */}
      {currentPlan && (currentPlan.features?.length ?? 0) > 0 && (
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-4">Your Benefits</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlan.features.map((feature, index) => (
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
      )}

      {/* Membership summary when no history from API */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-xl font-bold text-foreground mb-4">Membership Summary</h3>
        <div className="space-y-3">
          {joinDate && (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-lime-500" />
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium">Membership Started</p>
                <p className="text-muted-foreground text-sm">{formatDate(joinDate)}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                {membershipType || '—'}
              </span>
            </div>
          )}
          {!joinDate && (
            <p className="text-muted-foreground text-sm">No membership history to show.</p>
          )}
        </div>
      </div>
    </div>
  );
}
