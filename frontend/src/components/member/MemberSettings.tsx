import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMembers } from '@/data/mockData';

export function MemberSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const member = mockMembers[0];

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
          <p className="text-muted-foreground">Manage your account and preferences</p>
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Personal Information</h3>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted/50 mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-muted-foreground text-sm">Recommended: 200x200px</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Full Name</label>
                <Input
                  defaultValue={member.name}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  defaultValue={member.phone}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Date of Birth</label>
                <Input
                  type="date"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground mb-2 block">Bio</label>
                <Textarea
                  placeholder="Tell us about your fitness goals..."
                  className="bg-muted/50 border-border text-foreground resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Fitness Goals</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Primary Goal</label>
                <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                  <option>Build Muscle</option>
                  <option>Lose Weight</option>
                  <option>Improve Endurance</option>
                  <option>General Fitness</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Target Weight (lbs)</label>
                <Input
                  type="number"
                  placeholder="180"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Preferred Training Days</label>
                <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                  <option>3 days</option>
                  <option>4 days</option>
                  <option>5 days</option>
                  <option>6 days</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Experience Level</label>
                <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
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
                { label: 'Training Reminders', description: 'Get notified about your scheduled training sessions', checked: true },
                { label: 'Meal Reminders', description: 'Get notified about your meal times', checked: true },
                { label: 'Membership Updates', description: 'Get notified about membership changes', checked: true },
                { label: 'Payment Reminders', description: 'Get notified before payment due dates', checked: true },
                { label: 'Promotional Offers', description: 'Receive special offers and discounts', checked: false },
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
                <span className="px-3 py-1 rounded-full bg-lime-500/20 text-lime-500 text-sm">
                  Default
                </span>
              </div>
            </div>
            <Button variant="outline" className="mt-4 border-border text-foreground hover:bg-muted/50">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <div className="p-6 rounded-xl bg-card/50 border border-border">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Billing Address</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Street Address</label>
                <Input
                  defaultValue="123 Main Street"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">City</label>
                <Input
                  defaultValue="New York"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">State</label>
                <Input
                  defaultValue="NY"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">ZIP Code</label>
                <Input
                  defaultValue="10001"
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
