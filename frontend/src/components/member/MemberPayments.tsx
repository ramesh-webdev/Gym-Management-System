import { useState } from 'react';
import {
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockPayments, mockMembers } from '@/data/mockData';
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

export function MemberPayments() {
  const member = mockMembers[0];
  const myPayments = mockPayments.filter(p => p.memberId === member.id);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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

  const totalPaid = myPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Payments</h1>
          <p className="text-muted-foreground">View your payment history and invoices</p>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
              <CreditCard className="w-4 h-4 mr-2" />
              Make Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Make a Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-sm mb-1">Current Balance</p>
                <p className="font-display text-3xl font-bold text-foreground">$49.00</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Payment Amount</label>
                <input
                  type="number"
                  defaultValue="49"
                  className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-lime-500/30">
                    <CreditCard className="w-5 h-5 text-lime-500" />
                    <span className="text-foreground">•••• •••• •••• 4242</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                Pay $49.00
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: `$${totalPaid}`, icon: CheckCircle, color: 'text-lime-500' },
          { label: 'Pending', value: '$0.00', icon: Clock, color: 'text-yellow-500' },
          { label: 'Next Payment', value: 'Feb 1, 2024', icon: Calendar, color: 'text-blue-500' },
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

      {/* Payment Methods */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-foreground">Payment Methods</h3>
          <Button variant="ghost" size="sm" className="text-lime-500 hover:text-lime-400">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Add New
          </Button>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-lime-500/30">
          <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-foreground font-medium">Visa ending in 4242</p>
            <p className="text-muted-foreground text-sm">Expires 12/25</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-lime-500/20 text-lime-500 text-sm">
            Default
          </span>
        </div>
      </div>

      {/* Payment History */}
      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-foreground">Payment History</h3>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted/50">
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
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myPayments.map((payment) => (
                <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                  <TableCell className="text-foreground font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {payment.type.replace('_', ' ')}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lime-500 hover:text-lime-400 hover:bg-lime-500/10"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
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
