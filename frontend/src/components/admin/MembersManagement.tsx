import { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  UserCheck,
  UserX,
  Mail,
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
import { Badge } from '@/components/ui/badge';
import { mockMembers, mockMembershipPlans } from '@/data/mockData';

export function MembersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.membershipId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesPlan = planFilter === 'all' || member.membershipType === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-lime-500/20 text-lime-500 hover:bg-lime-500/30">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground">Manage gym members and their memberships</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                  <Input className="bg-muted/50 border-border text-foreground" placeholder="John" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                  <Input className="bg-muted/50 border-border text-foreground" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mobile Number</label>
                <Input className="bg-muted/50 border-border text-foreground" placeholder="9876543210" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Membership Plan</label>
                <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                  {mockMembershipPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ${plan.price}/mo</option>
                  ))}
                </select>
              </div>
              <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                Create Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
          >
            <option value="all">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Elite">Elite</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl bg-card/50 border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Member</TableHead>
              <TableHead className="text-muted-foreground">Membership ID</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Expiry Date</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-foreground font-medium">{member.name}</p>
                      <p className="text-muted-foreground text-sm">{member.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{member.membershipId}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${member.membershipType === 'Elite'
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : member.membershipType === 'Pro'
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                    {member.membershipType}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.membershipExpiry.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                        <Mail className="w-4 h-4 mr-2" />
                        Send SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Renew Membership
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                        <UserX className="w-4 h-4 mr-2" />
                        Suspend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {filteredMembers.length} of {mockMembers.length} members
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
