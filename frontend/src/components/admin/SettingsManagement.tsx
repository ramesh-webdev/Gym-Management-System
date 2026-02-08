import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  Save,
  Upload,
  Camera,
  Plus,
  Edit2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
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
import type { User } from '@/types';

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

  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<User | null>(null);

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

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
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

            {/* Logo Upload */}
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted/50 mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-muted-foreground text-sm">Recommended size: 200x200px</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Gym Name</label>
                <Input
                  defaultValue="KO Fitness"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  defaultValue="info@kofitness.com"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  defaultValue="+1 (555) 123-4567"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Website</label>
                <Input
                  defaultValue="www.gymflow.com"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground mb-2 block">Address</label>
                <Textarea
                  defaultValue="123 Fitness Street, Gym City, GC 12345"
                  className="bg-muted/50 border-border text-foreground resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Working Hours</h3>
            <div className="space-y-4">
              {['Monday - Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="text-foreground w-32">{day}</span>
                  <Input
                    type="time"
                    defaultValue="05:00"
                    className="bg-muted/50 border-border text-foreground w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    defaultValue="23:00"
                    className="bg-muted/50 border-border text-foreground w-32"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
                Update Password
              </Button>
            </div>
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
                  <p className="text-muted-foreground py-8">Loading staff...</p>
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
    </div>
  );
}
