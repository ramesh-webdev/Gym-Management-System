import { useState } from 'react';
import {
  Shield,
  User as UserIcon,
  Weight,
  Ruler,
  Activity,
  Contact,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function MemberSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Password updated successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Account Security</h1>
          <p className="text-muted-foreground">Manage your password and security preferences</p>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-card/50 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-ko-500" />
          <h3 className="font-display text-xl font-bold text-foreground">Change Password</h3>
        </div>
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
          <Button
            className="bg-lime-500 text-primary-foreground hover:bg-lime-400"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>

      {/* Basic Profile Details */}
      <div className="p-6 rounded-xl bg-card/50 border border-border mt-6">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="w-5 h-5 text-ko-500" />
          <h3 className="font-display text-xl font-bold text-foreground">Basic Profile Info</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Physical Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Physical Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Age</label>
                <Input type="number" placeholder="28" className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Gender</label>
                <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                  <option value="male">Male</option>
                  <option value="female" selected>Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Weight className="w-3 h-3" /> Weight (kg)
                </label>
                <Input type="number" placeholder="62" className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Ruler className="w-3 h-3" /> Height (cm)
                </label>
                <Input type="number" placeholder="168" className="bg-muted/50 border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Fitness Goals</label>
              <div className="flex flex-wrap gap-2">
                {['Muscle Gain', 'Strength Training'].map(goal => (
                  <Badge key={goal} variant="secondary" className="px-3 py-1 bg-ko-500/10 text-ko-500 border-ko-500/20">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Contact className="w-4 h-4" /> Emergency Contact
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Contact Name</label>
                <Input placeholder="David Johnson" className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    +91
                  </span>
                  <Input type="tel" placeholder="9876543217" className="rounded-l-none bg-muted/50 border-border" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground"
            onClick={() => toast.success('Profile details updated!')}
          >
            Save Profile Details
          </Button>
        </div>
      </div>
    </div>
  );
}
