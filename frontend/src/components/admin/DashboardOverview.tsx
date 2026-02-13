import {
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Dumbbell,
  Users,
  TrendingUp,
  IndianRupee,
  UserPlus,
  Receipt,
  Calendar,
  UserCog,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardOverview } from '@/api/dashboard';
import type { DashboardOverviewResponse } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { formatDate } from '@/utils/date';
import { formatRangeLabel } from '@/utils/dateRange';
import { Button } from '@/components/ui/button';
import {
  DateRangeFilter,
  getDateRangeParams,
  type DateRangeFilterValue,
} from '@/components/ui/date-range-filter';

function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function formatRevenue(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

const defaultDateFilter: DateRangeFilterValue = {
  preset: 'all',
  dateFrom: null,
  dateTo: null,
};

export function DashboardOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>(defaultDateFilter);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = getDateRangeParams(dateFilter);
    getDashboardOverview(params)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateFilter]);

  useEffect(() => {
    if (!cardsRef.current || loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, cardsRef);
    return () => ctx.revert();
  }, [loading]);

  const stats = data?.stats;
  const trendStr = (n: number | undefined) =>
    n == null || n === 0 ? '' : n > 0 ? `+${n}%` : `${n}%`;

  const statCards = stats
    ? [
        {
          title: 'Total Members',
          value: stats.totalMembers.toLocaleString('en-IN'),
          change: trendStr(stats.membersTrend),
          trend: (stats.membersTrend ?? 0) >= 0 ? 'up' as const : 'down' as const,
          icon: Users,
          color: 'bg-blue-500/20 text-blue-500',
        },
        {
          title: 'Active Members',
          value: stats.activeMembers.toLocaleString('en-IN'),
          icon: TrendingUp,
          color: 'bg-ko-500/20 text-ko-500',
        },
        {
          title: 'New This Month',
          value: stats.newMembersThisMonth.toLocaleString('en-IN'),
          icon: UserPlus,
          color: 'bg-emerald-500/20 text-emerald-500',
        },
        {
          title: 'Trainers',
          value: (stats.totalTrainers ?? 0).toLocaleString('en-IN'),
          icon: UserCog,
          color: 'bg-violet-500/20 text-violet-500',
        },
        {
          title: 'Monthly Revenue',
          value: formatRevenue(stats.monthlyRevenue),
          change: trendStr(stats.revenueTrend),
          trend: (stats.revenueTrend ?? 0) >= 0 ? 'up' as const : 'down' as const,
          icon: IndianRupee,
          color: 'bg-green-500/20 text-green-500',
        },
        {
          title: 'Total Revenue',
          value: formatRevenue(stats.totalRevenue),
          icon: Receipt,
          color: 'bg-teal-500/20 text-teal-500',
        },
        {
          title: 'Pending Payments',
          value: stats.pendingPayments.toLocaleString('en-IN'),
          icon: Receipt,
          color: 'bg-amber-500/20 text-amber-500',
        },
        {
          title: 'Expiring (14 days)',
          value: stats.expiringMemberships.toLocaleString('en-IN'),
          icon: Calendar,
          color: 'bg-orange-500/20 text-orange-500',
        },
      ]
    : [];

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const hasDateRange = Boolean(data?.dateRange?.dateFrom && data?.dateRange?.dateTo);

  return (
    <div className="p-6 space-y-6">
      {/* Page Title + Date Filter + Expiring Alert */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeFilter
              value={dateFilter}
              onChange={setDateFilter}
              showAllTime={true}
              compact={false}
            />
            {!loading && data && data.stats.expiringMemberships > 0 && (
              <Button
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                onClick={() => navigate('/admin/members')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {data.stats.expiringMemberships} expiring in 14 days
              </Button>
            )}
          </div>
        </div>
        {hasDateRange && data?.dateRange && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground px-1">
            <span>
              Showing data from {formatRangeLabel(data.dateRange.dateFrom, data.dateRange.dateTo)}
            </span>
            {data.stats.periodRevenue != null && (
              <span className="text-foreground font-medium">
                · Revenue in period: ₹{data.stats.periodRevenue.toLocaleString('en-IN')}
              </span>
            )}
            {data.stats.periodNewMembers != null && (
              <span className="text-foreground font-medium">
                · New members: {data.stats.periodNewMembers}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid - 8 cards */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statCards.map((stat, index) => (
            <div
              key={index}
              className="stat-card p-5 rounded-xl bg-card/50 border border-border hover:border-border/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                {'change' in stat && stat.change && (
                  <div
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>
              <h3 className="text-muted-foreground text-sm mb-0.5">{stat.title}</h3>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Revenue Chart + Expiring List */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-xl font-bold text-foreground mb-6">
            {hasDateRange ? 'Revenue (selected period)' : 'Revenue (last 12 months)'}
          </h3>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : data?.revenueChartData?.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [formatRevenue(value), 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--ko-500))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--ko-500))', strokeWidth: 0 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Expiring members list */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">
            Expiring soon (14 days)
          </h3>
          {loading ? (
            <ListSkeleton />
          ) : !data?.expiringMembers?.length ? (
            <p className="text-sm text-muted-foreground py-4">No memberships expiring in the next 14 days.</p>
          ) : (
            <div className="space-y-2">
              {data.expiringMembers.slice(0, 6).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-foreground font-medium text-sm truncate">{m.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {m.membershipType} · {m.membershipExpiry ? formatDate(m.membershipExpiry) : '—'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-ko-500"
                    onClick={() => navigate('/admin/members')}
                  >
                    View
                  </Button>
                </div>
              ))}
              {data.expiringMembers.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => navigate('/admin/members')}
                >
                  View all members
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Members + Recent Payments */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Recent Members</h3>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                className="text-ko-500 hover:text-ko-600"
                onClick={() => navigate('/admin/members')}
              >
                View All
              </Button>
            )}
          </div>
          {loading ? (
            <ListSkeleton />
          ) : !data?.recentMembers?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No members yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentMembers.slice(0, 6).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/members')}
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{member.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-muted-foreground text-sm">
                        {member.membershipType} Plan
                      </span>
                      {member.hasPersonalTraining && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-ko-500/20 text-ko-500">
                          <Dumbbell className="w-3 h-3" />
                          PT
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-xs ${
                      member.status === 'active'
                        ? 'bg-ko-500/20 text-ko-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Recent Payments</h3>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                className="text-ko-500 hover:text-ko-600"
                onClick={() => navigate('/admin/payments')}
              >
                View All
              </Button>
            )}
          </div>
          {loading ? (
            <ListSkeleton />
          ) : !data?.recentPayments?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayments.slice(0, 6).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{payment.memberName}</p>
                    <p className="text-muted-foreground text-xs truncate">
                      {payment.invoiceNumber}
                      {payment.planName ? ` · ${payment.planName}` : ''}
                      {payment.productName ? ` · ${payment.productName}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-foreground font-medium">
                      {formatRevenue(payment.amount)}
                    </p>
                    <span
                      className={`text-xs ${
                        payment.status === 'paid'
                          ? 'text-emerald-500'
                          : payment.status === 'pending'
                            ? 'text-amber-500'
                            : 'text-red-500'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
