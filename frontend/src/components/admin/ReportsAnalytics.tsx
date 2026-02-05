import { useState } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
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
} from 'recharts';

const memberGrowthData = [
  { month: 'Jan', members: 980 },
  { month: 'Feb', members: 1050 },
  { month: 'Mar', members: 1120 },
  { month: 'Apr', members: 1180 },
  { month: 'May', members: 1210 },
  { month: 'Jun', members: 1247 },
];

const revenueByPlanData = [
  { name: 'Basic', value: 35, color: '#6b7280' },
  { name: 'Pro', value: 45, color: '#a3ff00' },
  { name: 'Elite', value: 20, color: '#8b5cf6' },
];

const attendanceByHourData = [
  { hour: '6AM', count: 25 },
  { hour: '8AM', count: 65 },
  { hour: '10AM', count: 45 },
  { hour: '12PM', count: 35 },
  { hour: '2PM', count: 30 },
  { hour: '4PM', count: 55 },
  { hour: '6PM', count: 85 },
  { hour: '8PM', count: 60 },
];

const trainerPerformanceData = [
  { name: 'Marcus', clients: 45, rating: 4.9 },
  { name: 'Lisa', clients: 38, rating: 4.8 },
  { name: 'David', clients: 42, rating: 4.9 },
  { name: 'Sophia', clients: 35, rating: 5.0 },
];

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('last30days');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
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
          <Button variant="outline" className="border-border text-foreground hover:bg-muted/50">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: '1,247', change: '+12%', icon: Users, color: 'bg-blue-500/20 text-blue-500' },
          { label: 'Avg. Attendance', value: '87/day', change: '+8%', icon: Activity, color: 'bg-purple-500/20 text-purple-500' },
          { label: 'Revenue Growth', value: '+23%', change: '+5%', icon: TrendingUp, color: 'bg-lime-500/20 text-lime-500' },
          { label: 'Avg. Member Value', value: '$487', change: '+15%', icon: DollarSign, color: 'bg-green-500/20 text-green-500' },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-card/50 border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-lime-500 text-sm font-medium">{stat.change}</span>
            </div>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Member Growth */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Member Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowthData}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3ff00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a3ff00" stopOpacity={0}/>
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
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#a3ff00"
                  fillOpacity={1}
                  fill="url(#colorMembers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Revenue by Plan</h3>
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {revenueByPlanData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground text-sm">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Attendance by Hour */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Peak Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByHourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                <Bar dataKey="count" fill="#a3ff00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trainer Performance */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Trainer Performance</h3>
          <div className="space-y-4">
            {trainerPerformanceData.map((trainer) => (
              <div key={trainer.name} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center">
                  <span className="text-lime-500 font-medium">{trainer.name[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-medium">{trainer.name}</span>
                    <span className="text-lime-500 text-sm">{trainer.rating} ★</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-lime-500"
                      style={{ width: `${(trainer.clients / 50) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground text-xs">{trainer.clients} active clients</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Reports</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Member List', description: 'Complete member directory', icon: Users },
            { name: 'Payment Summary', description: 'Revenue breakdown', icon: DollarSign },
            { name: 'Attendance Report', description: 'Daily check-in logs', icon: Activity },
            { name: 'Trainer Schedule', description: 'Class and session times', icon: Calendar },
          ].map((report, index) => (
            <button
              key={index}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted border border-border hover:border-lime-500/30 transition-all text-left"
            >
              <report.icon className="w-6 h-6 text-lime-500 mb-3" />
              <h4 className="text-foreground font-medium mb-1">{report.name}</h4>
              <p className="text-muted-foreground text-sm">{report.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
