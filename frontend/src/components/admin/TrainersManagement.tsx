import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Users,
  Phone,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer, type TrainerListItem } from '@/api/trainers';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

/** Trainer with form-only firstName/lastName for the edit dialog */
type EditingTrainer = TrainerListItem & { firstName: string; lastName: string };

function TrainerSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>
      <div className="space-y-3 mb-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function TrainersManagement() {
  const confirmDialog = useConfirmDialog();
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<EditingTrainer | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newTrainerData, setNewTrainerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    specialization: '',
    experience: '',
    bio: '',
  });

  useEffect(() => {
    loadTrainers();
  }, [statusFilter]);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const data = await getTrainers(statusFilter === 'all' ? undefined : statusFilter);
      setTrainers(data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load trainers');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trainer: TrainerListItem) => {
    const [firstName, ...lastNameParts] = trainer.name.split(' ');
    setEditingTrainer({
      ...trainer,
      firstName,
      lastName: lastNameParts.join(' '),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete trainer',
      description: 'Are you sure you want to delete this trainer? This will remove their assignment from all members.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await deleteTrainer(id);
      toast.success('Trainer deleted successfully');
      loadTrainers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete trainer');
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainerData.firstName || !newTrainerData.lastName || !newTrainerData.phone || !newTrainerData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (newTrainerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const specialization = newTrainerData.specialization
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await createTrainer({
        name: `${newTrainerData.firstName} ${newTrainerData.lastName}`,
        phone: newTrainerData.phone,
        password: newTrainerData.password,
        specialization,
        experience: newTrainerData.experience ? Number(newTrainerData.experience) : undefined,
        bio: newTrainerData.bio || undefined,
      });
      toast.success('Trainer created successfully');
      setIsAddDialogOpen(false);
      setNewTrainerData({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        specialization: '',
        experience: '',
        bio: '',
      });
      loadTrainers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create trainer');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainer) return;
    if (!editingTrainer.firstName || !editingTrainer.lastName || !editingTrainer.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const specialization = (editingTrainer.specialization as any)
        ?.split(',')
        ?.map((s: string) => s.trim())
        ?.filter(Boolean) || editingTrainer.specialization || [];
      const updateData: any = {
        name: `${editingTrainer.firstName} ${editingTrainer.lastName}`,
        phone: editingTrainer.phone,
        specialization: Array.isArray(specialization) ? specialization : [],
        experience: editingTrainer.experience ? Number(editingTrainer.experience) : undefined,
        bio: editingTrainer.bio || undefined,
        status: editingTrainer.status,
      };
      if ((editingTrainer as any).newPassword) {
        updateData.newPassword = (editingTrainer as any).newPassword;
      }
      await updateTrainer(editingTrainer.id, updateData);
      toast.success('Trainer updated successfully');
      setIsEditDialogOpen(false);
      setEditingTrainer(null);
      loadTrainers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update trainer');
    } finally {
      setSaving(false);
    }
  };

  const filteredTrainers = trainers.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    const headers = [
      'Trainer ID',
      'Name',
      'Phone',
      'Status',
      'Specializations',
      'Experience (Years)',
      'Rating',
      'Active Clients',
      'Bio',
      'Joined Date'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = filteredTrainers.map((trainer) => {
      return [
        trainer.id,
        trainer.name,
        trainer.phone,
        trainer.status,
        trainer.specialization.join('; '),
        trainer.experience || 0,
        trainer.rating || 0,
        trainer.clientsCount || 0,
        trainer.bio || '',
        trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString() : '—'
      ].map(escapeCSV);
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ko_fitness_trainers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Trainers & Staff</h1>
          <p className="text-muted-foreground">Manage trainers and staff members</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted/50"
            onClick={handleExport}
            disabled={filteredTrainers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
                <Plus className="w-4 h-4 mr-2" />
                Add Trainer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Add New Trainer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTrainer} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">First Name *</label>
                    <Input
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="John"
                      value={newTrainerData.firstName}
                      onChange={(e) => setNewTrainerData({ ...newTrainerData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Last Name *</label>
                    <Input
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="Doe"
                      value={newTrainerData.lastName}
                      onChange={(e) => setNewTrainerData({ ...newTrainerData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Phone *</label>
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="9876543210"
                    value={newTrainerData.phone}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, phone: e.target.value })}
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Password *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      className="bg-muted/50 border-border text-foreground pr-10"
                      placeholder="••••••••"
                      value={newTrainerData.password}
                      onChange={(e) => setNewTrainerData({ ...newTrainerData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Specializations (comma-separated)</label>
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="e.g. Strength Training, HIIT, Yoga"
                    value={newTrainerData.specialization}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, specialization: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Experience (years)</label>
                  <Input
                    type="number"
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="5"
                    value={newTrainerData.experience}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, experience: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Bio</label>
                  <Textarea
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="Brief description about the trainer..."
                    rows={3}
                    value={newTrainerData.bio}
                    onChange={(e) => setNewTrainerData({ ...newTrainerData, bio: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
                >
                  {saving ? 'Creating...' : 'Create Trainer'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trainers..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Trainers Grid */}
        {
          loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <TrainerSkeleton key={i} />)}
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No trainers found. Create your first trainer!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="p-6 rounded-xl bg-card/50 border border-border hover:border-border transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-primary-foreground font-bold text-xl">
                          {trainer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground">{trainer.name}</h3>
                          <div className="flex items-center gap-1 text-lime-500">
                            <Star className="w-4 h-4 fill-lime-500" />
                            <span className="text-sm font-medium">{trainer.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            className="text-foreground hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleEdit(trainer)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                            onClick={() => handleDelete(trainer.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Phone className="w-4 h-4" />
                        {trainer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="w-4 h-4" />
                        {trainer.clientsCount || 0} active clients
                      </div>
                    </div>

                    {/* Specializations */}
                    {trainer.specialization && trainer.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trainer.specialization.map((spec, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-muted/50 text-muted-foreground hover:bg-muted"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Experience & Status */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-muted-foreground text-sm">Experience</p>
                        <p className="text-foreground font-medium">{trainer.experience || 0} years</p>
                      </div>
                      <Badge
                        className={
                          trainer.status === 'active'
                            ? 'bg-lime-500/20 text-lime-500'
                            : trainer.status === 'suspended'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-muted text-muted-foreground'
                        }
                      >
                        {trainer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTrainers.length)} of {filteredTrainers.length} trainers
                  </p>
                  <Pagination className="w-auto mx-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          (page === 2 && currentPage > 3) ||
                          (page === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )
        }

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Edit Trainer</DialogTitle>
            </DialogHeader>
            {editingTrainer && (
              <form onSubmit={handleUpdateTrainer} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">First Name *</label>
                    <Input
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="John"
                      value={editingTrainer.firstName}
                      onChange={(e) => setEditingTrainer({ ...editingTrainer, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Last Name *</label>
                    <Input
                      className="bg-muted/50 border-border text-foreground"
                      placeholder="Doe"
                      value={editingTrainer.lastName}
                      onChange={(e) => setEditingTrainer({ ...editingTrainer, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Phone *</label>
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="9876543210"
                    value={editingTrainer.phone}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, phone: e.target.value })}
                    required
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">New Password (leave blank to keep current)</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      className="bg-muted/50 border-border text-foreground pr-10"
                      placeholder="••••••••"
                      value={(editingTrainer as any).newPassword || ''}
                      onChange={(e) => setEditingTrainer({ ...editingTrainer, newPassword: e.target.value } as any)}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Specializations (comma-separated)</label>
                  <Input
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="e.g. Strength Training, HIIT, Yoga"
                    value={Array.isArray(editingTrainer.specialization) ? editingTrainer.specialization.join(', ') : editingTrainer.specialization || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, specialization: e.target.value } as any)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Experience (years)</label>
                  <Input
                    type="number"
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="5"
                    value={editingTrainer.experience || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, experience: Number(e.target.value) } as any)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Bio</label>
                  <Textarea
                    className="bg-muted/50 border-border text-foreground"
                    placeholder="Brief description about the trainer..."
                    rows={3}
                    value={editingTrainer.bio || ''}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, bio: e.target.value } as any)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                    value={editingTrainer.status}
                    onChange={(e) => setEditingTrainer({ ...editingTrainer, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      );
}
