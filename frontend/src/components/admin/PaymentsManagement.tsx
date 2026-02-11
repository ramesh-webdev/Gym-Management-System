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
} from 'lucide-react';
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

const PAYMENT_TYPES: Payment['type'][] = ['membership', 'personal_training', 'product', 'other'];
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

export function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const now = new Date();
  const thisMonthRevenue = payments
    .filter((p) => {
      if (p.status !== 'paid' || !p.date) return false;
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyRevenueMap: Record<string, number> = {};
  payments
    .filter((p) => p.status === 'paid' && p.date)
    .forEach((p) => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + p.amount;
    });
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return {
      month: MONTHS[d.getMonth()],
      revenue: monthlyRevenueMap[key] || 0,
    };
  });

  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const overdueCount = payments.filter((p) => p.status === 'overdue').length;
  const last7DaysRevenue = payments
    .filter((p) => {
      if (p.status !== 'paid' || !p.date) return false;
      const d = new Date(p.date);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((sum, p) => sum + p.amount, 0);
  const lastMonthRevenue = payments
    .filter((p) => {
      if (p.status !== 'paid' || !p.date) return false;
      const d = new Date(p.date);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return d >= lastMonth && d <= endLastMonth;
    })
    .reduce((sum, p) => sum + p.amount, 0);
  const avgPayment = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;
  const paymentStatusChartData = [
    { name: 'Paid', value: paidCount, color: '#a3ff00' },
    { name: 'Pending', value: pendingCount, color: '#fbbf24' },
    { name: 'Overdue', value: overdueCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);
  if (paymentStatusChartData.length === 0) {
    paymentStatusChartData.push({ name: 'No data', value: 1, color: 'hsl(var(--muted))' });
  }

  const handleCreatePayment = async () => {
    const member = members.find((m) => m.id === formMemberId);
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

  const selectedMember = members.find((m) => m.id === formMemberId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage invoices and track payments (automatic flow; Razorpay later)</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted/50" disabled>
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
                      {members.map((m) => (
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
                      <Select value={formPlanId || 'renewal'} onValueChange={(v) => setFormPlanId(v === 'renewal' ? '' : v)}>
                        <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                          <SelectValue placeholder="Select plan..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="renewal">Current plan (renewal)</SelectItem>
                          {membershipPlans.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — ₹{p.price?.toLocaleString() ?? '—'}/{p.duration === 1 ? 'mo' : `${p.duration} mo`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1.5">Choose &quot;Current plan (renewal)&quot; to extend existing membership, or a specific plan for new join or upgrade.</p>
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
                  disabled={!selectedMember || !formAmount.trim() || Number(formAmount) <= 0 || formSubmitting}
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
        <div className="p-5 rounded-xl bg-gradient-to-br from-lime-500/15 to-lime-500/5 border border-lime-500/30">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-5 h-5 text-lime-500" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Lifetime</span>
          </div>
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{paidCount} paid transaction{paidCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="p-5 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">This month</span>
          </div>
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{thisMonthRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last month: ₹{lastMonthRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-card/50 border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</span>
          </div>
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{pendingCount} invoice{pendingCount !== 1 ? 's' : ''} awaiting payment</p>
        </div>
        <div className="p-5 rounded-xl bg-card/50 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Overdue</span>
          </div>
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{overdueAmount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{overdueCount} past due</p>
        </div>
        <div className="p-5 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last 7 days</span>
          </div>
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground">₹{last7DaysRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Avg ₹{avgPayment.toLocaleString()} per payment
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Monthly Revenue (last 6 months)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: '#a3ff00' }}
                />
                <Bar dataKey="revenue" fill="#a3ff00" radius={[4, 4, 0, 0]} />
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

      {/* Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
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
                      {payment.date ? new Date(payment.date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span
                          className={`capitalize ${
                            payment.status === 'paid'
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
      </div>
    </div>
  );
}
