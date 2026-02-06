import { useState } from 'react';
import {
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    </div>
  );
}
