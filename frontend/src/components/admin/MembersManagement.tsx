import { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Dumbbell,
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
  const [ptFilter, setPtFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: '',
    membershipPlan: '',
    hasPersonalTraining: false,
  });

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.membershipId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesPlan = planFilter === 'all' || member.membershipType === planFilter;
    const matchesPT = ptFilter === 'all' ||
      (ptFilter === 'yes' && member.hasPersonalTraining) ||
      (ptFilter === 'no' && !member.hasPersonalTraining);

    return matchesSearch && matchesStatus && matchesPlan && matchesPT;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-ko-500/20 text-ko-500 hover:bg-ko-500/30">Active</Badge>;
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
            <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
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
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="John"
                    value={newMemberData.firstName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="Doe"
                    value={newMemberData.lastName}
                    onChange={(e) => setNewMemberData({ ...newMemberData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mobile Number</label>
                <Input
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="9876543210"
                  value={newMemberData.mobile}
                  onChange={(e) => setNewMemberData({ ...newMemberData, mobile: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Password</label>
                <Input
                  type="password"
                  className="bg-muted/50 border-border text-foreground"
                  placeholder="••••••••"
                  value={newMemberData.password}
                  onChange={(e) => setNewMemberData({ ...newMemberData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Membership Plan</label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                  value={newMemberData.membershipPlan}
                  onChange={(e) => setNewMemberData({ ...newMemberData, membershipPlan: e.target.value })}
                >
                  <option value="">Select a plan</option>
                  {mockMembershipPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}/mo</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <input
                  type="checkbox"
                  id="hasPT"
                  checked={newMemberData.hasPersonalTraining}
                  onChange={(e) => setNewMemberData({ ...newMemberData, hasPersonalTraining: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-ko-500"
                />
                <label htmlFor="hasPT" className="text-sm text-foreground cursor-pointer flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-ko-500" />
                  Has Personal Training
                </label>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
                onClick={() => {
                  // In a real app, this would call an API
                  setIsAddDialogOpen(false);
                  setNewMemberData({
                    firstName: '',
                    lastName: '',
                    mobile: '',
                    password: '',
                    membershipPlan: '',
                    hasPersonalTraining: false,
                  });
                }}
              >
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
          <select
            value={ptFilter}
            onChange={(e) => setPtFilter(e.target.value)}
            className="h-10 px-4 rounded-lg bg-muted/50 border border-border text-foreground text-sm"
          >
            <option value="all">All PT Status</option>
            <option value="yes">With PT</option>
            <option value="no">Without PT</option>
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
              <TableHead className="text-muted-foreground">PT Status</TableHead>
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
                <TableCell>
                  {member.hasPersonalTraining ? (
                    <Badge className="bg-ko-500/20 text-ko-500 hover:bg-ko-500/30 flex items-center gap-1 w-fit">
                      <Dumbbell className="w-3 h-3" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">No</Badge>
                  )}
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
