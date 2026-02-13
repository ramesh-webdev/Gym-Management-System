import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  Save,
  Plus,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Trash2,
  Upload,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { menuItems } from './AdminSidebar';
import { toast } from 'sonner';
import { getStaff, createStaff, updateStaff } from '@/api/staff';
import { changePassword as apiChangePassword } from '@/api/auth';
import { getSettings, updateSettings, type GymSettingsResponse, type WorkingHoursEntry } from '@/api/settings';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  MAX_TESTIMONIAL_IMAGE_BYTES,
  type Testimonial,
  type CreateTestimonialBody,
} from '@/api/testimonials';
import type { User } from '@/types';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

function permissionLabels(permissionIds: string[] | undefined): string {
  if (!permissionIds || permissionIds.length === 0) return 'No access';
  return menuItems.filter((m) => permissionIds.includes(m.id)).map((m) => m.label).join(', ');
}

function AddStaffForm({
  showPassword,
  setShowPassword,
  onSuccess,
  saving,
  setSaving,
}: {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onSuccess: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [addPermissions, setAddPermissions] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.querySelector('[name="add-name"]') as HTMLInputElement)?.value?.trim();
    const phone = (form.querySelector('[name="add-phone"]') as HTMLInputElement)?.value?.trim();
    const password = (form.querySelector('[name="add-password"]') as HTMLInputElement)?.value;
    if (!name || !phone || !password) {
      toast.error('Name, phone and password are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await createStaff({ name, phone, password, permissions: addPermissions });
      toast.success('Staff user created');
      onSuccess();
      form.reset();
      setAddPermissions([]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
      <DialogHeader>
        <DialogTitle>Add New Staff User</DialogTitle>
        <DialogDescription>Create a new admin user and select their allowed pages.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input name="add-name" placeholder="John Doe" className="bg-muted border-border" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Phone Number</label>
          <Input name="add-phone" placeholder="9876543210" className="bg-muted border-border" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Input
              name="add-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="bg-muted border-border pr-10"
              minLength={6}
              required
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
        <div className="grid gap-2">
          <label className="text-sm font-medium">Pages Access</label>
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/50 max-h-[200px] overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={addPermissions.includes(item.id)}
                  onCheckedChange={(checked) =>
                    setAddPermissions((prev) =>
                      checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                    )
                  }
                  className="border-border data-[state=checked]:bg-ko-500"
                />
                <label className="text-sm cursor-pointer truncate">{item.label}</label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground">
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditStaffDialog({
  staff,
  onClose,
  onSuccess,
  saving,
  setSaving,
}: {
  staff: User | null;
  onClose: () => void;
  onSuccess: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const open = !!staff;

  useEffect(() => {
    if (staff) setEditPermissions(staff.permissions ?? []);
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    const form = e.target as HTMLFormElement;
    const name = (form.querySelector('[name="edit-name"]') as HTMLInputElement)?.value?.trim();
    const phone = (form.querySelector('[name="edit-phone"]') as HTMLInputElement)?.value?.trim();
    const status = (form.querySelector('[name="edit-status"]') as HTMLSelectElement)?.value as User['status'];
    const newPassword = (form.querySelector('[name="edit-password"]') as HTMLInputElement)?.value;
    setSaving(true);
    try {
      await updateStaff(staff.id, {
        name: name || staff.name,
        phone: phone || staff.phone,
        status: status || staff.status,
        permissions: editPermissions,
        ...(newPassword && newPassword.length >= 6 ? { newPassword } : {}),
      });
      toast.success('Staff updated');
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Staff: {staff?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input name="edit-name" defaultValue={staff?.name} className="bg-muted border-border" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input name="edit-phone" defaultValue={staff?.phone} className="bg-muted border-border" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Status</label>
            <select
              name="edit-status"
              defaultValue={staff?.status}
              className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ko-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Update Password (Optional)</label>
            <Input name="edit-password" type="password" placeholder="••••••••" className="bg-muted border-border" minLength={6} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Pages Access</label>
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/50 max-h-[200px] overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={editPermissions.includes(item.id)}
                    onCheckedChange={(checked) =>
                      setEditPermissions((prev) =>
                        checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                      )
                    }
                    className="border-border data-[state=checked]:bg-ko-500"
                  />
                  <label className="text-sm cursor-pointer truncate">{item.label}</label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface SettingsManagementProps {
  isSuperAdmin?: boolean;
}

export function SettingsManagement({ isSuperAdmin }: SettingsManagementProps) {
  const [activeTab, setActiveTab] = useState('gym');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [gymLoading, setGymLoading] = useState(true);
  const [gymEmail, setGymEmail] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [workingHours, setWorkingHours] = useState<WorkingHoursEntry[]>([
    { days: 'Mon - Fri', open: '06:00', close: '22:00' },
    { days: 'Sat', open: '06:00', close: '22:00' },
    { days: 'Sun', open: '06:00', close: '22:00' },
  ]);

  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<User | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', content: '', rating: 5 });
  const [testimonialImageBase64, setTestimonialImageBase64] = useState<string | null>(null);
  const [testimonialImageError, setTestimonialImageError] = useState<string | null>(null);

  const confirmDialog = useConfirmDialog();

  const loadStaff = () => {
    if (!isSuperAdmin) return;
    setStaffLoading(true);
    getStaff()
      .then(setStaffUsers)
      .catch(() => {
        toast.error('Failed to load staff');
        setStaffUsers([]);
      })
      .finally(() => setStaffLoading(false));
  };

  useEffect(() => {
    if (isSuperAdmin && activeTab === 'staff') loadStaff();
  }, [isSuperAdmin, activeTab]);

  const loadTestimonials = () => {
    setTestimonialsLoading(true);
    getTestimonials()
      .then(setTestimonials)
      .catch(() => {
        toast.error('Failed to load testimonials');
        setTestimonials([]);
      })
      .finally(() => setTestimonialsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'testimonials') loadTestimonials();
  }, [activeTab]);

  const handleDeleteTestimonial = (t: Testimonial) => {
    confirmDialog({
      title: 'Delete testimonial',
      description: `Remove "${t.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    }).then((ok: boolean) => {
      if (ok) {
        deleteTestimonial(t.id)
          .then(() => {
            toast.success('Testimonial removed');
            loadTestimonials();
          })
          .catch((err) => toast.error(err?.message || 'Failed to delete'));
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'gym') {
      setGymLoading(true);
        getSettings()
        .then((s: GymSettingsResponse) => {
          setGymEmail(s.email ?? '');
          setGymPhone(s.phone ?? '');
          setGymAddress(s.address ?? '');
          const entries = s.workingHours?.entries ?? [];
          const labels = ['Mon - Fri', 'Sat', 'Sun'];
          const normalized = labels.map((days) => {
            const match = entries.find((e) => {
              const d = (e.days || '').toLowerCase();
              if (days === 'Mon - Fri') return /mon|monday|fri|friday/.test(d) && !/sat|sun/.test(d);
              if (days === 'Sat') return /sat/.test(d);
              if (days === 'Sun') return /sun/.test(d);
              return false;
            });
            return match ? { ...match, days } : { days, open: '06:00', close: '22:00' };
          });
          setWorkingHours(normalized);
        })
        .catch(() => {})
        .finally(() => setGymLoading(false));
    }
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'gym') {
        await updateSettings({
          email: gymEmail,
          phone: gymPhone,
          address: gymAddress,
          workingHours: { entries: workingHours },
        });
        toast.success('Settings saved');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your gym and account settings</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/50 border border-border p-1 mb-6">
          {[
            { id: 'gym', label: 'Gym Info', icon: Building2 },
            { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
            { id: 'staff', label: 'Staff Access', icon: Users },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-ko-500 data-[state=active]:to-ko-600 data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Gym Info Tab */}
        <TabsContent value="gym" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Gym Information</h3>
            <p className="text-muted-foreground text-sm mb-6">This information is shown on the public contact section.</p>

            {gymLoading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={gymEmail}
                    onChange={(e) => setGymEmail(e.target.value)}
                    placeholder="info@gym.com"
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                  <Input
                    value={gymPhone}
                    onChange={(e) => setGymPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">Address</label>
                  <Textarea
                    value={gymAddress}
                    onChange={(e) => setGymAddress(e.target.value)}
                    placeholder="Full address for contact and map"
                    className="bg-muted/50 border-border text-foreground resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Working Hours */}
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Working Hours</h3>
            <p className="text-muted-foreground text-sm mb-4">Shown on the public contact section.</p>
            {gymLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {workingHours.map((entry, index) => (
                  <div key={entry.days} className="flex flex-wrap items-center gap-4">
                    <span className="text-foreground font-medium w-24">{entry.days}</span>
                    <Input
                      type="time"
                      value={entry.open}
                      onChange={(e) =>
                        setWorkingHours((prev) =>
                          prev.map((h, i) => (i === index ? { ...h, open: e.target.value } : h))
                        )
                      }
                      className="bg-muted/50 border-border text-foreground w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={entry.close}
                      onChange={(e) =>
                        setWorkingHours((prev) =>
                          prev.map((h, i) => (i === index ? { ...h, close: e.target.value } : h))
                        )
                      }
                      className="bg-muted/50 border-border text-foreground w-32"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Public Testimonials</h3>
                <p className="text-muted-foreground text-sm">Shown on the landing page. Image stored in DB (max 1MB).</p>
              </div>
              <Button
                onClick={() => {
                  setEditingTestimonial(null);
                  setTestimonialForm({ name: '', role: '', content: '', rating: 5 });
                  setTestimonialImageBase64(null);
                  setTestimonialImageError(null);
                  setIsTestimonialDialogOpen(true);
                }}
                className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
            {testimonialsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No testimonials yet. Add one to show on the public site.</p>
            ) : (
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <img
                      src={t.imageBase64 || t.avatar || ''}
                      alt={t.name}
                      className="w-14 h-14 rounded-full border border-border object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{t.name}</p>
                      <p className="text-muted-foreground text-sm truncate">{t.role || '—'}</p>
                      <p className="text-muted-foreground text-sm truncate mt-1">{t.content.length > 80 ? `${t.content.slice(0, 80)}…` : t.content}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-ko-500"
                        onClick={() => {
                          setEditingTestimonial(t);
                          setTestimonialForm({ name: t.name, role: t.role || '', content: t.content, rating: t.rating ?? 5 });
                          setTestimonialImageBase64(null);
                          setTestimonialImageError(null);
                          setIsTestimonialDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTestimonial(t)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Change Password</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (newPassword !== confirmPassword) {
                  toast.error('New password and confirmation do not match');
                  return;
                }
                if (newPassword.length < 6) {
                  toast.error('New password must be at least 6 characters');
                  return;
                }
                setPasswordSaving(true);
                try {
                  await apiChangePassword(currentPassword, newPassword);
                  toast.success('Password updated successfully');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                } catch (err: unknown) {
                  const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to update password';
                  toast.error(msg);
                } finally {
                  setPasswordSaving(false);
                }
              }}
              className="space-y-4 max-w-md"
            >
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  minLength={1}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <Button
                type="submit"
                disabled={passwordSaving}
                className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Staff Access Tab */}
        <TabsContent value="staff" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            {!isSuperAdmin ? (
              <p className="text-muted-foreground">Only super-admins can manage staff access.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Staff & Admin Management</h3>
                    <p className="text-muted-foreground text-sm">Create and manage admin users with restricted access</p>
                  </div>
                  <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff
                      </Button>
                    </DialogTrigger>
                    <AddStaffForm
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      onSuccess={() => { setIsAddStaffOpen(false); loadStaff(); }}
                      saving={staffSaving}
                      setSaving={setStaffSaving}
                    />
                  </Dialog>
                </div>

                {staffLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="space-y-2 text-right">
                            <Skeleton className="h-4 w-24 ml-auto" />
                            <Skeleton className="h-3 w-16 ml-auto" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {staffUsers.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-ko-500/10 flex items-center justify-center font-bold text-ko-500">
                            {staff.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-foreground font-medium">{staff.name}</p>
                              {staff.isSuperAdmin && <Lock className="w-3 h-3 text-muted-foreground" />}
                            </div>
                            <p className="text-muted-foreground text-xs">{staff.phone} • {staff.isSuperAdmin ? 'Super Admin' : 'Staff Admin'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <Badge variant="outline" className="text-[10px] mb-1">
                              {staff.isSuperAdmin ? 'All Access' : permissionLabels(staff.permissions)}
                            </Badge>
                            <div className="flex items-center justify-end gap-2">
                              <div className={`w-2 h-2 rounded-full ${staff.status === 'active' ? 'bg-ko-500' : 'bg-red-500'}`} />
                              <span className="text-xs text-muted-foreground capitalize">{staff.status}</span>
                            </div>
                          </div>
                          {!staff.isSuperAdmin ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-ko-500"
                              onClick={() => setEditStaff(staff)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <div className="w-8 h-8" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <EditStaffDialog
            staff={editStaff}
            onClose={() => setEditStaff(null)}
            onSuccess={() => { setEditStaff(null); loadStaff(); }}
            saving={staffSaving}
            setSaving={setStaffSaving}
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Testimonial Dialog */}
      <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
            <DialogDescription>Image is stored in the database. Max size 1MB.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!testimonialForm.name.trim() || !testimonialForm.content.trim()) {
                toast.error('Name and content are required');
                return;
              }
              setTestimonialSaving(true);
              try {
                if (editingTestimonial) {
                  await updateTestimonial(editingTestimonial.id, {
                    name: testimonialForm.name.trim(),
                    role: testimonialForm.role.trim() || undefined,
                    content: testimonialForm.content.trim(),
                    rating: testimonialForm.rating,
                    ...(testimonialImageBase64 != null ? { imageBase64: testimonialImageBase64 } : {}),
                  });
                  toast.success('Testimonial updated');
                } else {
                  await createTestimonial({
                    name: testimonialForm.name.trim(),
                    role: testimonialForm.role.trim() || undefined,
                    content: testimonialForm.content.trim(),
                    rating: testimonialForm.rating,
                    imageBase64: testimonialImageBase64 || undefined,
                  } as CreateTestimonialBody);
                  toast.success('Testimonial added');
                }
                setIsTestimonialDialogOpen(false);
                loadTestimonials();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to save');
              } finally {
                setTestimonialSaving(false);
              }
            }}
            className="grid gap-4 py-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={testimonialForm.name}
                onChange={(e) => setTestimonialForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Client name"
                className="bg-muted border-border"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role / subtitle</label>
              <Input
                value={testimonialForm.role}
                onChange={(e) => setTestimonialForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Member since 2023"
                className="bg-muted border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={testimonialForm.content}
                onChange={(e) => setTestimonialForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Testimonial quote"
                className="bg-muted border-border resize-none"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rating (1–5)</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={testimonialForm.rating}
                onChange={(e) =>
                  setTestimonialForm((f) => ({ ...f, rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)) }))
                }
                className="bg-muted border-border w-20"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Photo (optional, max 1MB)</label>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {(testimonialImageBase64 || editingTestimonial?.imageBase64) ? (
                    <img
                      src={testimonialImageBase64 || editingTestimonial?.imageBase64 || ''}
                      alt="Preview"
                      className="w-20 h-20 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border border-border bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-muted border-border"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      setTestimonialImageError(null);
                      if (!file) return;
                      if (file.size > MAX_TESTIMONIAL_IMAGE_BYTES) {
                        setTestimonialImageError('Image must be under 1MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        setTestimonialImageBase64(dataUrl);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {testimonialImageError && (
                    <p className="text-destructive text-sm mt-1">{testimonialImageError}</p>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">JPG, PNG or GIF. Max 1MB.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTestimonialDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={testimonialSaving} className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground">
                {testimonialSaving ? 'Saving...' : editingTestimonial ? 'Save changes' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
