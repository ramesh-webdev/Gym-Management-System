import { useState } from 'react';
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

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState('gym');
  const [isSaving, setIsSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Mock staff data
  const [staffUsers, setStaffUsers] = useState([
    { id: '1', name: 'Super Admin', phone: '9876543210', role: 'Super Admin', status: 'active', permissions: ['All Access'] },
    { id: '2', name: 'Manager Sarah', phone: '9876543211', role: 'Staff Admin', status: 'active', permissions: ['Dashboard', 'Members'] },
  ]);

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

          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Enable 2FA</p>
                <p className="text-muted-foreground text-sm">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-ko-500 peer-checked:to-ko-600"></div>
              </label>
            </div>
          </div>
        </TabsContent>

        {/* Staff Access Tab */}
        <TabsContent value="staff" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Staff & Admin Management</h3>
                <p className="text-muted-foreground text-sm">Create and manage admin users with restricted access</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Add New Staff User</DialogTitle>
                    <DialogDescription>
                      Create a new admin user and select their allowed pages.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input placeholder="John Doe" className="bg-muted border-border" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input placeholder="9876543210" className="bg-muted border-border" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="bg-muted border-border pr-10"
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
                            <Checkbox id={item.id} className="border-border data-[state=checked]:bg-ko-500" />
                            <label htmlFor={item.id} className="text-sm cursor-pointer truncate">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground"
                      onClick={() => toast.success('Staff user created successfully (Demo)')}
                    >
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

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
                        {staff.phone === '9876543210' && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{staff.phone} • {staff.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {staff.phone === '9876543210' ? 'All Access' : staff.permissions.join(', ')}
                      </Badge>
                      <div className="flex items-center justify-end gap-2">
                        <div className={`w-2 h-2 rounded-full ${staff.status === 'active' ? 'bg-ko-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-foreground capitalize">{staff.status}</span>
                      </div>
                    </div>

                    {staff.phone !== '9876543210' ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-ko-500">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-card border-border">
                          <DialogHeader>
                            <DialogTitle>Edit Staff: {staff.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Full Name</label>
                              <Input defaultValue={staff.name} className="bg-muted border-border" />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Phone Number</label>
                              <Input defaultValue={staff.phone} className="bg-muted border-border" />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Status</label>
                              <select
                                defaultValue={staff.status}
                                className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ko-500"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Update Password (Optional)</label>
                              <Input type="password" placeholder="••••••••" className="bg-muted border-border" />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Pages Access</label>
                              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/50 max-h-[200px] overflow-y-auto">
                                {menuItems.map((item) => (
                                  <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`edit-${staff.id}-${item.id}`}
                                      defaultChecked={staff.permissions.includes(item.label)}
                                      className="border-border data-[state=checked]:bg-ko-500"
                                    />
                                    <label htmlFor={`edit-${staff.id}-${item.id}`} className="text-sm cursor-pointer truncate">
                                      {item.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground">
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="w-8 h-8" /> // Spacer for super admin
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
