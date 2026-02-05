import { useEffect, useRef } from 'react';
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { mockDashboardStats, mockMembers, mockPayments } from '@/data/mockData';
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

const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 4500 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 4600 },
  { month: 'May', revenue: 5200 },
  { month: 'Jun', revenue: 5500 },
  { month: 'Jul', revenue: 5230 },
];



export function DashboardOverview() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, cardsRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    {
      title: 'Total Members',
      value: mockDashboardStats.totalMembers.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      title: 'Active Members',
      value: mockDashboardStats.activeMembers.toLocaleString(),
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-ko-500/20 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent',
    },
    {
      title: 'Monthly Revenue',
      value: `$${mockDashboardStats.monthlyRevenue.toLocaleString()}`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500/20 text-green-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {mockDashboardStats.expiringMemberships} memberships expiring soon
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card p-6 rounded-xl bg-card/50 border border-border hover:border-border/80 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent' : 'text-red-500'
                }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">{stat.title}</h3>
            <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-xl font-bold text-foreground mb-6">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
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
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a3ff00"
                  strokeWidth={2}
                  dot={{ fill: '#a3ff00', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Recent Members</h3>
            <button className="text-lime-600 dark:text-lime-500 text-sm hover:text-lime-500">View All</button>
          </div>
          <div className="space-y-4">
            {mockMembers.slice(0, 4).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{member.name}</p>
                  <p className="text-muted-foreground text-sm">{member.membershipType} Plan</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${member.status === 'active'
                  ? 'bg-ko-500/20 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent'
                  : 'bg-red-500/20 text-red-500'
                  }`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Recent Payments</h3>
            <button className="text-lime-600 dark:text-lime-500 text-sm hover:text-lime-500">View All</button>
          </div>
          <div className="space-y-4">
            {mockPayments.slice(0, 4).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-lime-500" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{payment.memberName}</p>
                  <p className="text-muted-foreground text-sm">{payment.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-medium">${payment.amount}</p>
                  <span className={`text-xs ${payment.status === 'paid'
                    ? 'bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent'
                    : payment.status === 'pending'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                    }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
