import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Dumbbell,
  Scale,
  Activity,
  Ruler,
  User as UserIcon,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { getMembers, createMember, updateMember, deleteMember } from '@/api/members';
import { getMembershipPlans } from '@/api/membership-plans';
import { getTrainers, type TrainerListItem } from '@/api/trainers';
import type { Member, MembershipPlan } from '@/types';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

export function MembersManagement() {
  const confirmDialog = useConfirmDialog();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    assignedTrainerId: '',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  const handleEdit = (member: Member) => {
    const [firstName, ...lastNameParts] = member.name.split(' ');
    setEditingMember({
      ...member,
      firstName,
      lastName: lastNameParts.join(' '),
      mobile: member.phone,
      membershipPlanId: typeof member.membershipPlan === 'object' ? (member.membershipPlan as any)?.id : member.membershipPlan || '',
      assignedTrainerId: member.assignedTrainer?.id || '',
    });
    setIsEditDialogOpen(true);
  };

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<any>(null);

  const handleDelete = async (memberId: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete member',
      description: 'Are you sure you want to delete this member?',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteMember(memberId);
      toast.success('Member deleted successfully');
      loadMembers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  const loadMembers = () => {
    setLoading(true);
    getMembers()
      .then(setMembers)
      .catch(() => {
        toast.error('Failed to load members');
        setMembers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
    getMembershipPlans()
      .then(setPlans)
      .catch(() => {
        toast.error('Failed to load membership plans');
        setPlans([]);
      });
    getTrainers()
      .then(setTrainers)
      .catch(() => {
        toast.error('Failed to load trainers');
        setTrainers([]);
      });
  }, []);

  const handleViewDetails = (member: Member) => {
    setSelectedMemberForDetails(member);
    setIsDetailsDialogOpen(true);
  };

  const filteredMembers = members.filter((member) => {
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
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle className="font-display text-2xl">Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0 pr-1">
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
                  pattern="[0-9]{10}"
                  maxLength={10}
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
                  <option value="">Select a plan (optional)</option>
                  {plans.filter(p => p.isActive && !p.isAddOn).map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}/{plan.duration === 1 ? 'mo' : `${plan.duration}mo`}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <input
                  type="checkbox"
                  id="hasPT"
                  checked={newMemberData.hasPersonalTraining}
                  onChange={(e) => setNewMemberData({ ...newMemberData, hasPersonalTraining: e.target.checked, assignedTrainerId: e.target.checked ? newMemberData.assignedTrainerId : '' })}
                  className="w-4 h-4 rounded border-border accent-ko-500"
                />
                <label htmlFor="hasPT" className="text-sm text-foreground cursor-pointer flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-ko-500" />
                  Has Personal Training
                </label>
              </div>
              {newMemberData.hasPersonalTraining && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Assign Trainer</label>
                  <select
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                    value={newMemberData.assignedTrainerId}
                    onChange={(e) => setNewMemberData({ ...newMemberData, assignedTrainerId: e.target.value })}
                  >
                    <option value="">Select a trainer (optional)</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name} {trainer.specialization.length > 0 ? `- ${trainer.specialization[0]}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
                disabled={saving}
                onClick={async () => {
                  if (!newMemberData.firstName || !newMemberData.lastName || !newMemberData.mobile || !newMemberData.password) {
                    toast.error('Please fill all required fields');
                    return;
                  }
                  if (newMemberData.password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    return;
                  }
                  setSaving(true);
                  try {
                    await createMember({
                      name: `${newMemberData.firstName} ${newMemberData.lastName}`,
                      phone: newMemberData.mobile,
                      password: newMemberData.password,
                      membershipPlanId: newMemberData.membershipPlan || undefined,
                      hasPersonalTraining: newMemberData.hasPersonalTraining,
                      assignedTrainerId: newMemberData.hasPersonalTraining && newMemberData.assignedTrainerId ? newMemberData.assignedTrainerId : undefined,
                    });
                    toast.success('Member created successfully');
                    setIsAddDialogOpen(false);
                    setNewMemberData({
                      firstName: '',
                      lastName: '',
                      mobile: '',
                      password: '',
                      membershipPlan: '',
                      hasPersonalTraining: false,
                      assignedTrainerId: '',
                    });
                    loadMembers();
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : 'Failed to create member');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? 'Creating...' : 'Create Member'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle className="font-display text-2xl">Edit Member</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4 pt-4 overflow-y-auto flex-1 min-h-0 pr-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                    <Input
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="John"
                      value={editingMember.firstName}
                      onChange={(e) => setEditingMember({ ...editingMember, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                    <Input
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="Doe"
                      value={editingMember.lastName}
                      onChange={(e) => setEditingMember({ ...editingMember, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Mobile Number</label>
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="9876543210"
                    value={editingMember.mobile}
                    onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as Member['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Membership Plan</label>
                  <select
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                    value={editingMember.membershipPlanId || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, membershipPlanId: e.target.value })}
                  >
                    <option value="">No plan</option>
                    {plans.filter(p => p.isActive && !p.isAddOn).map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}/{plan.duration === 1 ? 'mo' : `${plan.duration}mo`}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <input
                    type="checkbox"
                    id="edit-hasPT"
                    checked={editingMember.hasPersonalTraining}
                    onChange={(e) => setEditingMember({ ...editingMember, hasPersonalTraining: e.target.checked, assignedTrainerId: e.target.checked ? editingMember.assignedTrainerId : '' })}
                    className="w-4 h-4 rounded border-border accent-ko-500"
                  />
                  <label htmlFor="edit-hasPT" className="text-sm text-foreground cursor-pointer flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-ko-500" />
                    Has Personal Training
                  </label>
                </div>
                {editingMember.hasPersonalTraining && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Assign Trainer</label>
                    <select
                      className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                      value={editingMember.assignedTrainerId || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, assignedTrainerId: e.target.value })}
                    >
                      <option value="">No trainer assigned</option>
                      {trainers.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name} {trainer.specialization.length > 0 ? `- ${trainer.specialization[0]}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
                  disabled={saving}
                  onClick={async () => {
                    if (!editingMember) return;
                    if (!editingMember.firstName || !editingMember.lastName || !editingMember.mobile) {
                      toast.error('Please fill all required fields');
                      return;
                    }
                    setSaving(true);
                    try {
                      await updateMember(editingMember.id, {
                        name: `${editingMember.firstName} ${editingMember.lastName}`,
                        phone: editingMember.mobile,
                        status: editingMember.status,
                        membershipPlanId: editingMember.membershipPlanId || null,
                        hasPersonalTraining: editingMember.hasPersonalTraining,
                        assignedTrainerId: editingMember.hasPersonalTraining && editingMember.assignedTrainerId ? editingMember.assignedTrainerId : null,
                      });
                      toast.success('Member updated successfully');
                      setIsEditDialogOpen(false);
                      loadMembers();
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : 'Failed to update member');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Member Details / Metrics Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle className="font-display text-2xl">Member Metrics</DialogTitle>
            </DialogHeader>
            {selectedMemberForDetails && (
              <div className="space-y-6 pt-4 overflow-y-auto flex-1 min-h-0 pr-1">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-12 h-12 rounded-full bg-ko-500/10 flex items-center justify-center text-ko-500 font-bold text-xl">
                    {selectedMemberForDetails.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedMemberForDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMemberForDetails.membershipId} • {selectedMemberForDetails.membershipType} Plan</p>
                  </div>
                </div>

                {selectedMemberForDetails.onboardingData ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        <Scale className="w-3 h-3 text-ko-500" /> Weight
                      </div>
                      <p className="text-xl font-bold">{selectedMemberForDetails.onboardingData.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        <Ruler className="w-3 h-3 text-ko-500" /> Height
                      </div>
                      <p className="text-xl font-bold">{selectedMemberForDetails.onboardingData.height} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        <UserIcon className="w-3 h-3 text-ko-500" /> Age
                      </div>
                      <p className="text-xl font-bold">{selectedMemberForDetails.onboardingData.age} <span className="text-sm font-normal text-muted-foreground">years</span></p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        <Activity className="w-3 h-3 text-ko-500" /> Goals
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedMemberForDetails.onboardingData.fitnessGoals?.map((goal: string) => (
                          <Badge key={goal} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl">
                    <p className="text-muted-foreground italic">Onboarding incomplete for this member.</p>
                  </div>
                )}

                {selectedMemberForDetails.onboardingData?.emergencyContact && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Emergency Contact</h4>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="font-bold text-foreground">{selectedMemberForDetails.onboardingData.emergencyContact.name}</p>
                      <p className="text-sm text-muted-foreground">+91 {selectedMemberForDetails.onboardingData.emergencyContact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
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
      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading members...</div>
      ) : (
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
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-foreground font-medium">{member.name[0]}</span>
                        )}
                      </div>
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
                      {member.membershipType || 'No plan'}
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
                    {member.membershipExpiry
                      ? new Date(member.membershipExpiry).toLocaleDateString()
                      : 'No plan'}
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
                          className="text-foreground hover:bg-muted cursor-pointer"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-foreground hover:bg-muted cursor-pointer"
                          onClick={() => handleViewDetails(member)}
                        >
                          <UserIcon className="w-4 h-4 mr-2" />
                          View Metrics
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
                        <DropdownMenuItem
                          className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {filteredMembers.length} of {members.length} members
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
