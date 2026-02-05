import { useState } from 'react';
import {
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Upload,
  Camera,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState('gym');
  const [isSaving, setIsSaving] = useState(false);

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
          className="bg-lime-500 text-primary-foreground hover:bg-lime-400"
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
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'billing', label: 'Billing', icon: CreditCard },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-lime-500 data-[state=active]:text-primary-foreground text-muted-foreground"
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
                  defaultValue="GymFlow Fitness"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  defaultValue="info@gymflow.com"
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Personal Information</h3>
            
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-lime-500/20 flex items-center justify-center">
                <span className="text-lime-500 text-2xl font-bold">A</span>
              </div>
              <div>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted/50 mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">First Name</label>
                <Input
                  defaultValue="Admin"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Last Name</label>
                <Input
                  defaultValue="User"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  defaultValue="admin@gymflow.com"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  defaultValue="+1 555-0000"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground mb-2 block">Bio</label>
                <Textarea
                  defaultValue="Gym administrator with 5+ years of experience."
                  className="bg-muted/50 border-border text-foreground resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'New member registrations', description: 'Get notified when a new member joins', checked: true },
                { label: 'Payment received', description: 'Get notified when a payment is received', checked: true },
                { label: 'Membership expiring', description: 'Get notified when memberships are about to expire', checked: true },
                { label: 'Low attendance alerts', description: 'Get notified when attendance is below average', checked: false },
                { label: 'System updates', description: 'Get notified about system updates and maintenance', checked: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-foreground font-medium">{item.label}</p>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                  </label>
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
              <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
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
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
              </label>
            </div>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-lime-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">•••• •••• •••• 4242</p>
                    <p className="text-muted-foreground text-sm">Expires 12/25</p>
                  </div>
                </div>
                <Badge className="bg-lime-500/20 text-lime-500">Default</Badge>
              </div>
            </div>
            <Button variant="outline" className="mt-4 border-border text-foreground hover:bg-muted/50">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Billing History</h3>
            <div className="space-y-3">
              {[
                { date: 'Jan 1, 2024', amount: '$99.00', status: 'Paid' },
                { date: 'Dec 1, 2023', amount: '$99.00', status: 'Paid' },
                { date: 'Nov 1, 2023', amount: '$99.00', status: 'Paid' },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-foreground font-medium">Pro Plan Subscription</p>
                    <p className="text-muted-foreground text-sm">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-foreground font-medium">{invoice.amount}</span>
                    <Badge className="bg-lime-500/20 text-lime-500">{invoice.status}</Badge>
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
