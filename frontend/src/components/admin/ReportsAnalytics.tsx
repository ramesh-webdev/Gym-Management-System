import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { getMembers } from '@/api/members';
import { listPayments } from '@/api/payments';
import { getTrainers, type TrainerListItem } from '@/api/trainers';
import { getMembershipPlans } from '@/api/membership-plans';
import type { Member, Payment, MembershipPlan } from '@/types';
import { formatDate } from '@/utils/date';

const PLAN_COLORS: Record<string, string> = {
  Basic: '#6b7280',
  Pro: '#a3ff00',
  Elite: '#8b5cf6',
  Standard: '#3b82f6',
  Premium: '#f59e0b',
  Default: '#64748b',
};

function getMonthKey(date: Date | string | null | undefined): string {
  if (date == null) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getTimeMs(date: Date | string | null | undefined): number {
  if (date == null) return 0;
  const d = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function getDateRangeBounds(range: string): { start: number; end: number } {
  const end = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let start: number;
  switch (range) {
    case 'last7days':
      start = end - 7 * day;
      break;
    case 'last90days':
      start = end - 90 * day;
      break;
    case 'lastyear':
      start = end - 365 * day;
      break;
    default:
      start = end - 30 * day;
  }
  return { start, end };
}

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getMembers().then((list) => (Array.isArray(list) ? list : [])),
      listPayments().then((list) => (Array.isArray(list) ? list : [])),
      getTrainers().then((list) => (Array.isArray(list) ? list : [])),
      getMembershipPlans().then((list) => (Array.isArray(list) ? list : [])),
    ])
      .then(([m, p, t, pl]) => {
        setMembers(m);
        setPayments(p);
        setTrainers(t);
        setPlans(pl);
      })
      .catch((err) => setError(err?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const { start: rangeStart, end: rangeEnd } = useMemo(() => getDateRangeBounds(dateRange), [dateRange]);

  const paidPayments = useMemo(
    () => payments.filter((p) => p.status === 'paid' && getTimeMs(p.date) >= rangeStart && getTimeMs(p.date) <= rangeEnd),
    [payments, rangeStart, rangeEnd]
  );

  const totalRevenue = useMemo(() => paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0), [paidPayments]);
  const activeMembers = useMemo(() => members.filter((m) => m.status === 'active'), [members]);
  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pending' || p.status === 'overdue'), [payments]);
  const pendingAmount = useMemo(
    () => pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    [pendingPayments]
  );

  const memberGrowthData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    members.forEach((m) => {
      const key = getMonthKey(m.joinDate);
      if (!key) return;
      const t = getTimeMs(m.joinDate);
      if (t > 0 && t <= rangeEnd) {
        byMonth[key] = (byMonth[key] || 0) + 1;
      }
    });
    const sorted = Object.entries(byMonth)
      .map(([month, count]) => ({ month, members: count }))
      .sort((a, b) => {
        const aDate = new Date(a.month);
        const bDate = new Date(b.month);
        return aDate.getTime() - bDate.getTime();
      });
    const cum: { month: string; members: number }[] = [];
    let acc = 0;
    sorted.forEach(({ month, members: add }) => {
      acc += add;
      cum.push({ month, members: acc });
    });
    return cum.length ? cum : [{ month: getMonthKey(new Date()) || 'Now', members: members.length }];
  }, [members, rangeEnd]);

  const revenueByPlanData = useMemo(() => {
    const byPlan: Record<string, number> = {};
    paidPayments
      .filter((p) => p.type === 'membership')
      .forEach((p) => {
        const name = p.planName || 'Other';
        byPlan[name] = (byPlan[name] || 0) + (p.amount || 0);
      });
    const total = Object.values(byPlan).reduce((s, v) => s + v, 0);
    if (total === 0) {
      return plans
        .filter((p) => !p.isAddOn)
        .slice(0, 5)
        .map((p, i) => ({
          name: p.name,
          value: 0,
          amount: 0,
          color: PLAN_COLORS[p.name] || Object.values(PLAN_COLORS)[i % Object.keys(PLAN_COLORS).length] || PLAN_COLORS.Default,
        }));
    }
    const colors = Object.keys(PLAN_COLORS);
    return Object.entries(byPlan).map(([name], i) => ({
      name,
      value: Math.round((byPlan[name] / total) * 100),
      amount: byPlan[name],
      color: PLAN_COLORS[name] || colors[i % colors.length] || PLAN_COLORS.Default,
    }));
  }, [paidPayments, plans]);

  const revenueByTypeData = useMemo(() => {
    const byType: Record<string, number> = {};
    paidPayments.forEach((p) => {
      const label =
        p.type === 'membership'
          ? 'Membership'
          : p.type === 'personal_training'
            ? 'Personal Training'
            : p.type === 'product'
              ? 'Product'
              : 'Other';
      byType[label] = (byType[label] || 0) + (p.amount || 0);
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value, fill: '#a3ff00' }));
  }, [paidPayments]);

  const trainerPerformanceData = useMemo(
    () =>
      trainers
        .filter((t) => t.status === 'active')
        .map((t) => ({
          name: t.name,
          clients: t.clientsCount ?? 0,
          rating: t.rating ?? 0,
        }))
        .sort((a, b) => b.clients - a.clients)
        .slice(0, 8),
    [trainers]
  );

  const recentPayments = useMemo(
    () =>
      [...payments]
        .filter((p) => p.status === 'paid')
        .sort((a, b) => getTimeMs(b.date) - getTimeMs(a.date))
        .slice(0, 10),
    [payments]
  );

  const expiringSoon = useMemo(() => {
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return members
      .filter((m) => m.status === 'active' && m.membershipExpiry)
      .filter((m) => {
        const exp = getTimeMs(m.membershipExpiry);
        return exp > Date.now() && exp <= in30.getTime();
      })
      .sort((a, b) => getTimeMs(a.membershipExpiry) - getTimeMs(b.membershipExpiry))
      .slice(0, 10);
  }, [members]);

  const avgMemberValue = activeMembers.length > 0 ? Math.round(totalRevenue / activeMembers.length) : 0;

  const handleExport = () => {
    const lines = [
      'Report Period,' + dateRange,
      'Total Members,' + members.length,
      'Active Members,' + activeMembers.length,
      'Total Revenue (period),' + totalRevenue,
      'Pending Amount,' + pendingAmount,
      'Avg Member Value,' + avgMemberValue,
      '',
      'Revenue by Plan',
      ...revenueByPlanData.map((r) => `${r.name},${r.value}%,${r.amount ?? 0}`),
      '',
      'Payments by Type',
      ...revenueByTypeData.map((r) => `${r.name},${r.value}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights from members, payments, and trainers</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="lastyear">Last Year</option>
          </select>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted/50" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-card/50 border border-border space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : (
          [
            {
              label: 'Total Members',
              value: members.length.toLocaleString(),
              sub: `${activeMembers.length} active`,
              icon: Users,
              color: 'bg-blue-500/20 text-blue-500',
            },
            {
              label: 'Revenue (period)',
              value: `₹${totalRevenue.toLocaleString()}`,
              sub: `${paidPayments.length} paid payments`,
              icon: DollarSign,
              color: 'bg-lime-500/20 text-lime-500',
            },
            {
              label: 'Avg. Member Value',
              value: `₹${avgMemberValue.toLocaleString()}`,
              sub: activeMembers.length ? `of ${activeMembers.length} active` : '—',
              icon: TrendingUp,
              color: 'bg-green-500/20 text-green-500',
            },
            {
              label: 'Pending Payments',
              value: pendingPayments.length.toString(),
              sub: `₹${pendingAmount.toLocaleString()} due`,
              icon: CreditCard,
              color: 'bg-amber-500/20 text-amber-500',
            },
          ].map((stat, index) => (
            <div key={index} className="p-4 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.sub && <span className="text-muted-foreground text-xs">{stat.sub}</span>}
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Member Growth (cumulative joins)</h3>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberGrowthData}>
                  <defs>
                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a3ff00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a3ff00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="members" stroke="#a3ff00" fillOpacity={1} fill="url(#colorMembers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Revenue by Plan</h3>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : revenueByPlanData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No membership revenue in this period</div>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByPlanData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueByPlanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, _name: string, props: { payload?: { amount?: number } }) =>
                        props?.payload?.amount != null ? `₹${props.payload.amount.toLocaleString()} (${value}%)` : `${value}%`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {revenueByPlanData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground text-sm">
                      {item.name} ({item.value}%{item.amount != null ? ` — ₹${item.amount.toLocaleString()}` : ''})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payments by type + Trainer performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Revenue by Type</h3>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : revenueByTypeData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No payments in this period</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByTypeData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Amount (₹)" fill="#a3ff00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Trainer Performance</h3>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))
            ) : trainerPerformanceData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active trainers</p>
            ) : (
              trainerPerformanceData.map((trainer) => (
                <div key={trainer.name} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center">
                    <span className="text-lime-500 font-medium">{trainer.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-foreground font-medium">{trainer.name}</span>
                      <span className="text-lime-500 text-sm">{trainer.rating ? `${trainer.rating} ★` : '—'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-lime-500"
                        style={{
                        width: `${Math.min(
                          100,
                          trainerPerformanceData.some((t) => t.clients > 0)
                            ? (trainer.clients / Math.max(...trainerPerformanceData.map((t) => t.clients), 1)) * 100
                            : 0
                        )}%`,
                      }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground text-xs">{trainer.clients} active clients</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent payments & expiring memberships */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Payments</h3>
          {loading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : recentPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No paid payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2 pr-2">Member</th>
                    <th className="pb-2 pr-2">Type</th>
                    <th className="pb-2 pr-2">Amount</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-2 pr-2 text-foreground">{p.memberName}</td>
                      <td className="py-2 pr-2 text-muted-foreground capitalize">{p.type?.replace('_', ' ') ?? '—'}</td>
                      <td className="py-2 pr-2 text-foreground">₹{p.amount?.toLocaleString() ?? 0}</td>
                      <td className="py-2 text-muted-foreground">{formatDate(p.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Expiring in 30 Days
          </h3>
          {loading ? (
            <Skeleton className="h-56 w-full rounded-lg" />
          ) : expiringSoon.length === 0 ? (
            <p className="text-muted-foreground text-sm">No memberships expiring in the next 30 days</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2 pr-2">Member</th>
                    <th className="pb-2 pr-2">Plan</th>
                    <th className="pb-2">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoon.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2 pr-2 text-foreground">{m.name}</td>
                      <td className="py-2 pr-2 text-muted-foreground">
                        {typeof m.membershipPlan === 'object' && m.membershipPlan?.name
                          ? m.membershipPlan.name
                          : (m.membershipPlan as string) ?? '—'}
                      </td>
                      <td className="py-2 text-amber-600">{formatDate(m.membershipExpiry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reports */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Reports</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <Skeleton className="w-6 h-6 rounded-md" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          ) : (
            [
              { name: 'Member List', description: `${members.length} total members`, icon: Users },
              { name: 'Payment Summary', description: `${payments.length} payments · ₹${(payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)).toLocaleString()} total`, icon: DollarSign },
              { name: 'Trainer Schedule', description: `${trainers.length} trainers`, icon: Calendar },
              { name: 'Activity', description: `${paidPayments.length} paid in period`, icon: Activity },
            ].map((report, index) => (
              <button
                key={index}
                className="p-4 rounded-lg bg-muted/50 hover:bg-muted border border-border hover:border-lime-500/30 transition-all text-left"
              >
                <report.icon className="w-6 h-6 text-lime-500 mb-3" />
                <h4 className="text-foreground font-medium mb-1">{report.name}</h4>
                <p className="text-muted-foreground text-sm">{report.description}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
