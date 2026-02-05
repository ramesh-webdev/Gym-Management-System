import { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
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
import { mockPayments } from '@/data/mockData';
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

const paymentStatusData = [
  { name: 'Paid', value: 65, color: '#a3ff00' },
  { name: 'Pending', value: 25, color: '#fbbf24' },
  { name: 'Overdue', value: 10, color: '#ef4444' },
];

const monthlyRevenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 4500 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 4600 },
  { month: 'May', revenue: 5200 },
  { month: 'Jun', revenue: 5500 },
];

export function PaymentsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const totalRevenue = mockPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage invoices and track payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted/50">
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
            <DialogContent className="bg-card border-border text-foreground max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Member</label>
                  <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                    <option>Select member...</option>
                    <option>Sarah Johnson</option>
                    <option>Michael Chen</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount ($)</label>
                  <Input type="number" className="bg-muted/50 border-border text-foreground" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Payment Type</label>
                  <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                    <option>Membership</option>
                    <option>Personal Training</option>
                    <option>Product</option>
                    <option>Other</option>
                  </select>
                </div>
                <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                  Record Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-lime-500' },
          { label: 'Pending', value: `$${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-yellow-500' },
          { label: 'This Month', value: '$5,230', icon: CheckCircle, color: 'text-blue-500' },
          { label: 'Overdue', value: '$890', icon: XCircle, color: 'text-red-400' },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-card/50 border border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Monthly Revenue</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
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

        {/* Payment Status */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Payment Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
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
            {paymentStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="space-y-4">
        {/* Filters */}
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
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl bg-card/50 border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Invoice</TableHead>
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                  <TableCell className="text-foreground font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.memberName}</TableCell>
                  <TableCell>
                    <span className="capitalize text-muted-foreground">{payment.type.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">${payment.amount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.date.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`capitalize ${
                        payment.status === 'paid' ? 'text-lime-500' :
                        payment.status === 'pending' ? 'text-yellow-500' :
                        'text-red-400'
                      }`}>
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
                        <DropdownMenuItem className="text-foreground hover:bg-muted/50 cursor-pointer">
                          View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground hover:bg-muted/50 cursor-pointer">
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground hover:bg-muted/50 cursor-pointer">
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
