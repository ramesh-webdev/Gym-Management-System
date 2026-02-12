import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Receipt,
  Info,
  Wallet,
  Calendar,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { listPayments, createPayment, updatePayment } from '@/api/payments';
import { getMembers } from '@/api/members';
import { getMembershipPlans } from '@/api/membership-plans';
import type { Payment, Member, MembershipPlan } from '@/types';
import { formatDate } from '@/utils/date';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PAYMENT_STATUSES: Payment['status'][] = ['paid', 'pending', 'overdue', 'cancelled'];

function getStatusIcon(status: string) {
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
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function PaymentRowSkeleton() {
  return (
    <TableRow className="border-border hover:bg-transparent">
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
    </TableRow>
  );
}

function StatSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-card/50 border border-border">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-8 w-24 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formMemberId, setFormMemberId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<Payment['type']>('membership');
  const [formStatus, setFormStatus] = useState<Payment['status']>('pending');
  const [formPlanId, setFormPlanId] = useState('');
  const [formAddPT, setFormAddPT] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  const fetchPayments = useCallback(async () => {
    try {
      const data = await listPayments();
      setPayments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    getMembers().then(setMembers).catch(() => setMembers([]));
  }, []);
  useEffect(() => {
    getMembershipPlans().then(setPlans).catch(() => setPlans([]));
  }, []);

  const membershipPlans = plans.filter((p) => p.isActive !== false && !p.isAddOn);
  const activeMembers = members.filter((m) => m.status === 'active');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all' && p.date) {
      const d = new Date(p.date);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case 'today':
          matchesDate = d >= startOfToday;
          break;
        case 'yesterday': {
          const startOfYesterday = new Date(startOfToday);
          startOfYesterday.setDate(startOfYesterday.getDate() - 1);
          matchesDate = d >= startOfYesterday && d < startOfToday;
          break;
        }
        case 'this_week': {
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          matchesDate = d >= startOfWeek;
          break;
        }
        case 'last_week': {
          const startOfThisWeek = new Date(startOfToday);
          startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
          const startOfLastWeek = new Date(startOfThisWeek);
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
          matchesDate = d >= startOfLastWeek && d < startOfThisWeek;
          break;
        }
        case 'this_month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = d >= startOfMonth;
          break;
        }
        case 'last_month': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = d >= startOfLastMonth && d < startOfThisMonth;
          break;
        }
        case 'this_year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          matchesDate = d >= startOfYear;
          break;
        }
      }
    } else if (dateFilter !== 'all' && !p.date) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  // Filter payments for aggregated stats based ONLY on Date
  const statFilteredPayments = payments.filter((p) => {
    let matchesDate = true;
    if (dateFilter !== 'all' && p.date) {
      const d = new Date(p.date);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case 'today':
          matchesDate = d >= startOfToday;
          break;
        case 'yesterday': {
          const startOfYesterday = new Date(startOfToday);
          startOfYesterday.setDate(startOfYesterday.getDate() - 1);
          matchesDate = d >= startOfYesterday && d < startOfToday;
          break;
        }
        case 'this_week': {
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          matchesDate = d >= startOfWeek;
          break;
        }
        case 'last_week': {
          const startOfThisWeek = new Date(startOfToday);
          startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
          const startOfLastWeek = new Date(startOfThisWeek);
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
          matchesDate = d >= startOfLastWeek && d < startOfThisWeek;
          break;
        }
        case 'this_month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = d >= startOfMonth;
          break;
        }
        case 'last_month': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = d >= startOfLastMonth && d < startOfThisMonth;
          break;
        }
        case 'this_year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          matchesDate = d >= startOfYear;
          break;
        }
      }
    } else if (dateFilter !== 'all' && !p.date) {
      matchesDate = false;
    }

    return matchesDate;
  });

  const totalRevenue = statFilteredPayments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = statFilteredPayments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = statFilteredPayments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const cancelledAmount = statFilteredPayments.filter((p) => p.status === 'cancelled').reduce((sum, p) => sum + p.amount, 0);

  const paidCount = statFilteredPayments.filter((p) => p.status === 'paid').length;
  const pendingCount = statFilteredPayments.filter((p) => p.status === 'pending').length;
  const overdueCount = statFilteredPayments.filter((p) => p.status === 'overdue').length;
  const cancelledCount = statFilteredPayments.filter((p) => p.status === 'cancelled').length;

  const avgPayment = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

  const paymentStatusChartData = [
    { name: 'Paid', value: paidCount, color: '#a3ff00' },
    { name: 'Pending', value: pendingCount, color: '#fbbf24' },
    { name: 'Overdue', value: overdueCount, color: '#ef4444' },
    { name: 'Cancelled', value: cancelledCount, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  if (paymentStatusChartData.length === 0) {
    paymentStatusChartData.push({ name: 'No data', value: 1, color: 'hsl(var(--muted))' });
  }

  const getDateLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'this_week': return 'This Week';
      case 'last_week': return 'Last Week';
      case 'this_month': return 'This Month';
      case 'last_month': return 'Last Month';
      case 'this_year': return 'This Year';
      default: return 'Lifetime';
    }
  };

  const handleCreatePayment = async () => {
    const member = activeMembers.find((m) => m.id === formMemberId);
    if (!member || !formAmount.trim() || Number(formAmount) <= 0) return;
    setFormSubmitting(true);
    setError(null);
    try {
      await createPayment({
        memberId: member.id,
        memberName: member.name,
        amount: Number(formAmount),
        type: formType,
        status: formStatus,
        ...(formType === 'membership' && formPlanId ? { membershipPlanId: formPlanId } : {}),
        ...(formType === 'membership' && formAddPT ? { addPersonalTraining: true } : {}),
      });
      await fetchPayments();
      setFormMemberId('');
      setFormAmount('');
      setFormType('membership');
      setFormStatus('pending');
      setFormPlanId('');
      setFormAddPT(false);
      setIsAddDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, status: Payment['status']) => {
    try {
      await updatePayment(paymentId, { status });
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status } : p))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  const selectedMember = activeMembers.find((m) => m.id === formMemberId);
  const selectedMemberHasPlan = selectedMember && !!(
    (selectedMember as Member).membershipPlan ||
    ((selectedMember as Member).membershipExpiry && new Date((selectedMember as Member).membershipExpiry) > new Date())
  );

  // When switching to a member with no plan, clear plan selection so admin must choose a plan
  useEffect(() => {
    if (formType === 'membership' && selectedMember && !selectedMemberHasPlan) {
      setFormPlanId('');
    }
  }, [formMemberId, formType, selectedMember, selectedMemberHasPlan]);

  const handleExport = () => {
    const headers = [
      'Invoice Number',
      'Member Name',
      'Member ID',
      'Type',
      'Plan Name',
      'Product Name',
      'Personal Training Add-on',
      'Amount (₹)',
      'Date',
      'Due Date',
      'Status',
      'Created At'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = filteredPayments.map((p) => {
      return [
        p.invoiceNumber,
        p.memberName,
        p.memberId,
        p.type,
        p.planName || '—',
        p.productName || '—',
        p.addPersonalTraining ? 'Yes' : 'No',
        p.amount,
        p.date ? formatDate(p.date) : '—',
        p.dueDate ? formatDate(p.dueDate) : '—',
        p.status,
        p.createdAt ? formatDate(p.createdAt) : '—'
      ].map(escapeCSV);
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ko_fitness_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage invoices and track payments (Razorpay online; record offline here)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card/50 border border-border rounded-lg px-3 h-10">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent border-none text-foreground text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-card">All Time</option>
              <option value="today" className="bg-card">Today</option>
              <option value="yesterday" className="bg-card">Yesterday</option>
              <option value="this_week" className="bg-card">This Week</option>
              <option value="last_week" className="bg-card">Last Week</option>
              <option value="this_month" className="bg-card">This Month</option>
              <option value="last_month" className="bg-card">Last Month</option>
              <option value="this_year" className="bg-card">This Year</option>
            </select>
          </div>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted/50"
            onClick={handleExport}
            disabled={filteredPayments.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
              <DialogHeader className="shrink-0">
                <DialogTitle className="font-display text-2xl flex items-center gap-2">
                  <Wallet className="w-6 h-6" />
                  Record Payment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2 overflow-y-auto flex-1 min-h-0 pr-1">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-0.5">When to use this</p>
                    <p>Use this to record a payment received offline (cash, cheque, bank transfer at desk). For online payments, members pay from their Membership or Payments page and entries appear automatically. Mark as <strong>Paid</strong> when the amount is received; for <strong>Membership</strong> type, marking Paid will extend the member&apos;s plan.</p>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Member</label>
                  <Select value={formMemberId} onValueChange={setFormMemberId}>
                    <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Select the member who made the payment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} {m.membershipId ? `(${m.membershipId})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">Required. Choose the member this payment is for.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="e.g. 1500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Enter the amount received, in rupees.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Payment type</label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as Payment['type'])}>
                    <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="membership">Membership — plan renewal or upgrade</SelectItem>
                      <SelectItem value="personal_training">Personal training — PT add-on</SelectItem>
                      <SelectItem value="product">Product — shop purchase</SelectItem>
                      <SelectItem value="other">Other — misc fees</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {formType === 'membership' && 'Select if this is for a membership plan. Marking as Paid will extend or set the member\'s plan.'}
                    {formType === 'personal_training' && 'Select if this is for adding personal training (diet plans, trainer support).'}
                    {formType === 'product' && 'Select if this is for a product bought from the shop.'}
                    {formType === 'other' && 'Use for any other payment (e.g. locker, event).'}
                  </p>
                </div>
                {formType === 'membership' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Plan</label>
                      <Select
                        value={formPlanId || (selectedMemberHasPlan ? 'renewal' : '')}
                        onValueChange={(v) => setFormPlanId(v === 'renewal' ? '' : v)}
                      >
                        <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                          <SelectValue placeholder={selectedMemberHasPlan ? 'Select plan...' : 'Select plan (required for new member)...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedMemberHasPlan && (
                            <SelectItem value="renewal">Current plan (renewal)</SelectItem>
                          )}
                          {membershipPlans.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — ₹{p.price?.toLocaleString() ?? '—'}/{p.duration === 1 ? 'mo' : `${p.duration} mo`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {selectedMemberHasPlan
                          ? 'Choose &quot;Current plan (renewal)&quot; to extend existing membership, or a specific plan for new join or upgrade.'
                          : 'This member has no current plan. Select the plan they are joining on.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="add-pt"
                        checked={formAddPT}
                        onCheckedChange={(c) => setFormAddPT(c === true)}
                        className="border-border data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                      />
                      <label htmlFor="add-pt" className="text-sm text-foreground cursor-pointer">Add personal training to this payment</label>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as Payment['status'])}>
                    <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending — not yet received</SelectItem>
                      <SelectItem value="paid">Paid — received (membership will extend if type is Membership)</SelectItem>
                      <SelectItem value="overdue">Overdue — past due date</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">Set to <strong>Paid</strong> only when you have received the amount.</p>
                </div>
                <Button
                  className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
                  disabled={
                    !selectedMember ||
                    !formAmount.trim() ||
                    Number(formAmount) <= 0 ||
                    formSubmitting ||
                    (formType === 'membership' && !selectedMemberHasPlan && !formPlanId)
                  }
                  onClick={handleCreatePayment}
                >
                  {formSubmitting ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && !isAddDialogOpen && (
        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <div className="p-5 rounded-xl bg-gradient-to-br from-lime-500/15 to-lime-500/5 border border-lime-500/30">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-lime-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{getDateLabel()} Revenue</span>
              </div>
              <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{paidCount} paid transaction{paidCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="p-5 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-5 h-5 text-koBlue-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{getDateLabel()} Avg</span>
              </div>
              <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{avgPayment.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {paidCount} payment{paidCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-card/50 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</span>
              </div>
              <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{pendingCount} invoice{pendingCount !== 1 ? 's' : ''} {dateFilter === 'all' ? 'total' : 'in period'}</p>
            </div>
            <div className="p-5 rounded-xl bg-card/50 border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Overdue</span>
              </div>
              <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{overdueCount} past due {dateFilter === 'all' ? '' : 'in period'}</p>
            </div>
            <div className="p-5 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cancelled</span>
              </div>
              <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{cancelledAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {cancelledCount} transaction{cancelledCount !== 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Revenue Trend ({getDateLabel()})</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(() => {
                const now = new Date();
                const chartData: { label: string; revenue: number }[] = [];

                if (dateFilter === 'this_year' || dateFilter === 'all') {
                  // Show monthly for this year
                  MONTHS.forEach((m, i) => {
                    const rev = statFilteredPayments
                      .filter(p => p.status === 'paid' && p.date && new Date(p.date).getMonth() === i && new Date(p.date).getFullYear() === now.getFullYear())
                      .reduce((s, p) => s + p.amount, 0);
                    chartData.push({ label: m, revenue: rev });
                  });
                } else if (dateFilter === 'this_month' || dateFilter === 'last_month') {
                  // Show daily for the month
                  const targetMonth = dateFilter === 'this_month' ? now.getMonth() : now.getMonth() - 1;
                  const targetYear = now.getFullYear();
                  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
                  for (let i = 1; i <= daysInMonth; i++) {
                    const rev = statFilteredPayments
                      .filter(p => {
                        if (p.status !== 'paid' || !p.date) return false;
                        const d = new Date(p.date);
                        return d.getDate() === i && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
                      })
                      .reduce((s, p) => s + p.amount, 0);
                    chartData.push({ label: i.toString(), revenue: rev });
                  }
                } else {
                  // Default to last 6 months trend
                  for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const rev = payments // use all payments for the 6 month trend to keep context
                      .filter(p => p.status === 'paid' && p.date && new Date(p.date).getMonth() === d.getMonth() && new Date(p.date).getFullYear() === d.getFullYear())
                      .reduce((s, p) => s + p.amount, 0);
                    chartData.push({ label: MONTHS[d.getMonth()], revenue: rev });
                  }
                }
                return chartData;
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                  itemStyle={{ color: '#a3ff00' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#a3ff00" radius={[4, 4, 0, 0]} barSize={dateFilter.includes('month') ? 8 : 30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Payment Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {paymentStatusChartData.filter((d) => d.name !== 'No data').map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4 pt-10 border-t border-border mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h2 className="font-display text-xl font-bold text-foreground">Transaction Details</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search member or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10 h-9 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-card/50 border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Invoice</TableHead>
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">For</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <PaymentRowSkeleton key={i} />)
              ) : paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-foreground font-medium">{payment.invoiceNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.memberName}</TableCell>
                    <TableCell>
                      <span className="capitalize text-muted-foreground">{payment.type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.type === 'membership' && (payment.planName
                        ? `${payment.planName}${payment.addPersonalTraining ? ' + PT' : ''}`
                        : payment.addPersonalTraining
                          ? 'Membership + PT'
                          : 'Membership')
                      }
                      {payment.type === 'product' && (payment.productName || 'Product')}
                      {payment.type === 'personal_training' && 'Personal training'}
                      {payment.type === 'other' && '—'}
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            className="text-foreground hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              setViewPayment(payment);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Info className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <div className="h-px bg-border my-1" />
                          {PAYMENT_STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              className="text-foreground hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleUpdateStatus(payment.id, s)}
                            >
                              Mark as {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
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
                  // Logic to show limited page numbers if totalPages is large
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
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl flex items-center gap-2">
                <Receipt className="w-6 h-6 text-lime-500" />
                Payment Details
              </DialogTitle>
            </DialogHeader>
            {viewPayment && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Invoice Number</label>
                    <p className="text-foreground font-semibold">{viewPayment.invoiceNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Status</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getStatusIcon(viewPayment.status)}
                      <span className="capitalize font-medium">{viewPayment.status}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Member</label>
                    <p className="text-foreground">{viewPayment.memberName}</p>
                    <p className="text-xs text-muted-foreground">ID: {viewPayment.memberId}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Amount</label>
                    <p className="text-foreground font-bold text-lg">₹{viewPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Type</label>
                    <p className="capitalize text-foreground">{viewPayment.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">For</label>
                    <p className="text-foreground">
                      {viewPayment.type === 'membership' && (viewPayment.planName
                        ? `${viewPayment.planName}${viewPayment.addPersonalTraining ? ' + PT' : ''}`
                        : viewPayment.addPersonalTraining ? 'Membership + PT' : 'Membership')
                      }
                      {viewPayment.type === 'product' && (viewPayment.productName || 'Product')}
                      {viewPayment.type === 'personal_training' && 'Personal Training'}
                      {viewPayment.type === 'other' && 'Miscellaneous'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Payment Date</label>
                    <p className="text-foreground">{formatDate(viewPayment.date)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</label>
                    <p className="text-foreground">{formatDate(viewPayment.dueDate)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Recorded on: {viewPayment.createdAt ? formatDate(viewPayment.createdAt) : '—'}</span>
                    <span>ID: {viewPayment.id}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-muted hover:bg-muted/80 text-foreground"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
