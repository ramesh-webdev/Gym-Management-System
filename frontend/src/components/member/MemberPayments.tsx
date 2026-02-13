import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Lock,
  ArrowLeft,
  Package,
  Ticket,
  Dumbbell,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { listPayments, createOrder, verifyPayment, cancelOrder } from '@/api/payments';
import { getProducts } from '@/api/products';
import { getMembershipPlans } from '@/api/membership-plans';
import { getSettings } from '@/api/settings';
import type { Payment, Product, MembershipPlan } from '@/types';
import { formatDate } from '@/utils/date';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { openRazorpayCheckout, isRazorpayConfigured, RAZORPAY_CANCELLED_MESSAGE } from '@/utils/razorpay';
import { toast } from 'sonner';

type PayPurpose = 'product' | 'membership' | 'personal_training' | null;

export function MemberPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  // Purpose & selection
  const [purpose, setPurpose] = useState<PayPurpose>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [personalTrainingPrice, setPersonalTrainingPrice] = useState(500);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Razorpay-style flow state
  const [step, setStep] = useState<'purpose' | 'form' | 'checkout' | 'success'>('purpose');
  const [payAmount, setPayAmount] = useState(0);
  const [payType, setPayType] = useState<Payment['type']>('membership');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAmountRupees, setOrderAmountRupees] = useState(0);
  const [orderAmountPaise, setOrderAmountPaise] = useState(0);
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPayments({ page: currentPage, limit: itemsPerPage });
      setPayments(res.data);
      setTotalPayments(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments');
      setPayments([]);
      setTotalPayments(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const paginatedPayments = payments;

  useEffect(() => {
    getSettings().then((s) => setPersonalTrainingPrice(s.personalTrainingPrice ?? 500)).catch(() => { });
  }, []);

  const resetPayDialog = () => {
    setStep('purpose');
    setPurpose(null);
    setSelectedProduct(null);
    setSelectedPlan(null);
    setPayAmount(0);
    setPayType('membership');
    setOrderId(null);
    setOrderAmountRupees(0);
    setOrderAmountPaise(0);
    setRazorpayKey('');
    setVerifyError(null);
  };

  const handleOpenPayDialog = (open: boolean) => {
    setPayDialogOpen(open);
    if (!open) resetPayDialog();
  };

  useEffect(() => {
    if (!payDialogOpen) return;
    if (purpose === 'product') {
      setProductsLoading(true);
      getProducts({ page: 1, limit: 200 })
        .then((res) => setProducts((res.data || []).filter((p) => p.status === 'active')))
        .catch(() => setProducts([]))
        .finally(() => setProductsLoading(false));
    } else if (purpose === 'membership') {
      setPlansLoading(true);
      getMembershipPlans()
        .then((list) => setPlans((list || []).filter((p) => p.isActive !== false)))
        .catch(() => setPlans([]))
        .finally(() => setPlansLoading(false));
    } else if (purpose === 'personal_training') {
      setPlansLoading(true);
      getMembershipPlans()
        .then((list) => {
          const all = (list || []).filter((p) => p.isActive !== false);
          setPlans(all);
          const addOn = all.find((p) => p.isAddOn);
          if (addOn) {
            setPayAmount(addOn.price);
            setSelectedPlan(addOn);
            setPayType('membership');
          } else {
            setPayAmount(personalTrainingPrice);
            setSelectedPlan(null);
            setPayType('personal_training');
          }
        })
        .catch(() => setPlans([]))
        .finally(() => setPlansLoading(false));
    }
  }, [payDialogOpen, purpose, personalTrainingPrice]);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setSelectedPlan(null);
    setPayAmount(p.price);
    setPayType('product');
  };

  const handleSelectPlan = (p: MembershipPlan) => {
    setSelectedPlan(p);
    setSelectedProduct(null);
    setPayAmount(p.price);
    setPayType('membership');
  };

  const handleProceedToPay = async () => {
    if (payAmount <= 0) return;
    setSubmitting(true);
    setVerifyError(null);
    try {
      const ptAddOnPlan = selectedPlan?.isAddOn ? selectedPlan : null;
      const body = ptAddOnPlan
        ? { amount: ptAddOnPlan.price, type: 'membership' as const, membershipPlanId: ptAddOnPlan.id }
        : payType === 'product' && selectedProduct
          ? { amount: payAmount, type: 'product' as const, productId: selectedProduct.id }
          : { amount: payAmount, type: payType };
      const res = await createOrder(body);
      setOrderId(res.orderId);
      setOrderAmountRupees(res.amount / 100);
      setOrderAmountPaise(res.amount);
      setRazorpayKey(res.key);
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
      if (isRazorpayConfigured(razorpayKey)) {
        const result = await openRazorpayCheckout({
          key: razorpayKey,
          orderId,
          amount: orderAmountPaise,
          name: 'KO Fitness',
          description: 'Membership / Product payment',
        });
        await verifyPayment({
          orderId: result.razorpayOrderId,
          razorpayPaymentId: result.razorpayPaymentId,
          razorpaySignature: result.razorpaySignature,
        });
      } else {
        await verifyPayment({
          orderId,
          razorpayPaymentId: `auto_${orderId}`,
          razorpaySignature: 'auto_approved',
        });
      }
      setStep('success');
      await fetchPayments();
      toast.success('Payment successful!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment failed';
      if (msg === RAZORPAY_CANCELLED_MESSAGE && orderId) {
        try {
          await cancelOrder(orderId);
        } catch {
          // ignore cancel API errors
        }
        toast.info('Payment cancelled');
        setVerifyError(null);
      } else {
        setVerifyError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-lime-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const nextPending = payments
    .filter((p) => p.status === 'pending' && p.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
  const nextPaymentLabel = nextPending?.dueDate
    ? formatDate(nextPending.dueDate)
    : '—';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Payments</h1>
          <p className="text-muted-foreground">View your payment history and pay online</p>
        </div>
        <Dialog open={payDialogOpen} onOpenChange={handleOpenPayDialog}>
          <DialogTrigger asChild>
            <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
              <CreditCard className="w-4 h-4 mr-2" />
              Make Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle className="font-display text-2xl flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {step === 'purpose' && 'What would you like to pay for?'}
                {step === 'form' && (purpose === 'product' ? 'Select a product' : 'Select a membership plan')}
                {step === 'checkout' && 'Confirm Payment'}
                {step === 'success' && 'Payment Successful'}
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 min-h-0 pr-1">
              {step === 'purpose' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setPurpose('product'); setStep('form'); setSelectedProduct(null); setSelectedPlan(null); }}
                    className="p-4 rounded-xl border-2 border-border hover:border-lime-500/50 hover:bg-muted/50 text-left transition-colors"
                  >
                    <Package className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-foreground">Product purchase</p>
                    <p className="text-sm text-muted-foreground">Buy supplements, gear & more</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPurpose('membership'); setStep('form'); setSelectedProduct(null); setSelectedPlan(null); }}
                    className="p-4 rounded-xl border-2 border-border hover:border-lime-500/50 hover:bg-muted/50 text-left transition-colors"
                  >
                    <Ticket className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-foreground">Membership plans</p>
                    <p className="text-sm text-muted-foreground">Renew or buy a plan</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPurpose('personal_training');
                      setStep('form');
                      setSelectedProduct(null);
                      setSelectedPlan(null);
                      setPayAmount(personalTrainingPrice);
                      setPayType('personal_training');
                    }}
                    className="p-4 rounded-xl border-2 border-border hover:border-lime-500/50 hover:bg-muted/50 text-left transition-colors"
                  >
                    <Dumbbell className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-foreground">Personal training</p>
                    <p className="text-sm text-muted-foreground">Add-on: diet plans & trainer support</p>
                  </button>
                </div>
              )}

              {step === 'form' && (
                <div className="space-y-4 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground -mt-2"
                    onClick={() => { setStep('purpose'); setPurpose(null); setSelectedProduct(null); setSelectedPlan(null); setPayAmount(0); }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Change purpose
                  </Button>
                  {purpose === 'product' && (
                    <>
                      {productsLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading products...</p>
                      ) : products.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">No products available.</p>
                      ) : (
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectProduct(p)}
                              className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedProduct?.id === p.id
                                ? 'border-lime-500 bg-lime-500/10'
                                : 'border-border hover:bg-muted/50'
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-foreground">{p.name}</span>
                                <span className="font-semibold text-foreground">₹{p.price.toLocaleString()}</span>
                              </div>
                              {p.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {purpose === 'membership' && (
                    <>
                      {plansLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading plans...</p>
                      ) : plans.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">No membership plans available.</p>
                      ) : (
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                          {plans.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectPlan(p)}
                              className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedPlan?.id === p.id
                                ? 'border-lime-500 bg-lime-500/10'
                                : 'border-border hover:bg-muted/50'
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-foreground">{p.name}</span>
                                <span className="font-semibold text-foreground">₹{p.price.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {p.duration} month{p.duration !== 1 ? 's' : ''}
                                {p.description ? ` · ${p.description}` : ''}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {purpose === 'personal_training' && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      {plansLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      ) : selectedPlan?.isAddOn ? (
                        <>
                          <p className="font-medium text-foreground">{selectedPlan.name}</p>
                          <p className="text-muted-foreground text-sm mt-1">{selectedPlan.description}</p>
                          <p className="font-display text-xl font-bold text-foreground mt-2">₹{selectedPlan.price.toLocaleString()}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground text-sm">Personal training add-on (diet plans, trainer support). Not part of any monthly plan.</p>
                          <p className="font-display text-xl font-bold text-foreground mt-2">₹{personalTrainingPrice.toLocaleString()}</p>
                        </>
                      )}
                    </div>
                  )}
                  {(selectedProduct || selectedPlan || purpose === 'personal_training') && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Selected: {selectedProduct?.name ?? selectedPlan?.name ?? (payType === 'personal_training' ? 'Personal training add-on' : payType === 'membership' ? 'Membership plan' : 'Product')}
                      </p>
                      <p className="font-display text-xl font-bold text-foreground">₹{payAmount.toLocaleString()}</p>
                      {verifyError && (
                        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mt-2">{verifyError}</p>
                      )}
                      <Button
                        className="w-full mt-3 bg-lime-500 text-primary-foreground hover:bg-lime-400"
                        disabled={submitting}
                        onClick={handleProceedToPay}
                      >
                        {submitting ? 'Creating order...' : 'Proceed to Pay'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step === 'checkout' && (
                <div className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-muted-foreground text-sm">
                      {selectedPlan?.name ?? selectedProduct?.name ?? (payType === 'personal_training' ? 'Personal training add-on' : payType === 'membership' ? 'Membership plan' : 'Product')}
                    </p>
                    <p className="font-display text-2xl font-bold text-foreground mt-1">₹{orderAmountRupees.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs mt-1 capitalize">{payType.replace('_', ' ')}</p>
                  </div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Secure payment via Razorpay
                  </p>
                  {verifyError && (
                    <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{verifyError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-border text-foreground"
                      onClick={() => setStep('form')}
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
                  <p className="text-foreground font-medium">Your payment of ₹{orderAmountRupees.toLocaleString()} was successful.</p>
                  <p className="text-muted-foreground text-sm">Invoice will appear in your payment history.</p>
                  <Button
                    className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
                    onClick={() => handleOpenPayDialog(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-card/50 border border-border space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          ))
        ) : (
          [
            { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: CheckCircle, color: 'text-lime-500' },
            { label: 'Pending', value: `₹${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-yellow-500' },
            { label: 'Next Due', value: nextPaymentLabel, icon: Calendar, color: 'text-blue-500' },
          ].map((stat, index) => (
            <div key={index} className="p-4 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Payment History */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-foreground">Payment History</h3>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted/50" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Invoice</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No payments yet
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-foreground font-medium">{payment.invoiceNumber}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {payment.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">₹{payment.amount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span
                          className={`capitalize ${payment.status === 'paid'
                            ? 'text-lime-500'
                            : payment.status === 'pending'
                              ? 'text-yellow-500'
                              : 'text-red-400'
                            }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalPayments)} of {totalPayments} payments
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
    </div>
  );
}
