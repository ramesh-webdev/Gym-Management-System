import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/api/auth';
import { toast } from 'sonner';

export function TrainerSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Account Security</h1>
        <p className="text-muted-foreground">Manage your account settings and security</p>
      </div>

      {/* Change Password */}
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ko-500 to-ko-600 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Change Password</h2>
            <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="bg-muted/50 border-border text-foreground"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="bg-muted/50 border-border text-foreground"
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-muted/50 border-border text-foreground"
              placeholder="Confirm new password"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
