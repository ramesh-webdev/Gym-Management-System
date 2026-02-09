import { useState, useEffect } from 'react';
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
import { changePassword, updateMe, fetchMe } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import type { MemberOnboardingData } from '@/types';

export function MemberSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileData, setProfileData] = useState<MemberOnboardingData>({
    age: undefined,
    gender: undefined,
    weight: undefined,
    height: undefined,
    fitnessGoals: [],
    medicalConditions: '',
    emergencyContact: undefined,
  });

  const fitnessGoalsOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Cardio Fitness',
    'Flexibility',
    'Endurance',
    'Strength',
    'Overall Health',
    'Stress Relief'
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await fetchMe();
      if ((userData as any).onboardingData) {
        const od = (userData as any).onboardingData as MemberOnboardingData;
        setProfileData({
          age: od.age,
          gender: od.gender,
          weight: od.weight,
          height: od.height,
          fitnessGoals: od.fitnessGoals || [],
          medicalConditions: od.medicalConditions || '',
          emergencyContact: od.emergencyContact,
        });
      }
    } catch (err) {
      toast.error('Failed to load user data');
      navigate('/member/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
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
      await changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileData.age || !profileData.gender || !profileData.weight || !profileData.height) {
      toast.error('Please fill in all physical metrics (Age, Gender, Weight, Height)');
      return;
    }
    if (profileData.fitnessGoals && profileData.fitnessGoals.length === 0) {
      toast.error('Please select at least one fitness goal');
      return;
    }
    if (!profileData.emergencyContact?.name || !profileData.emergencyContact?.phone) {
      toast.error('Please fill in emergency contact details');
      return;
    }
    if (profileData.emergencyContact.phone.length !== 10) {
      toast.error('Emergency contact phone must be 10 digits');
      return;
    }
    setProfileSaving(true);
    try {
      await updateMe({ onboardingData: profileData });
      await loadUser(); // Reload to get updated data
      toast.success('Profile details updated successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals?.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...(prev.fitnessGoals || []), goal]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

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
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Current Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-muted/50 border-border text-foreground"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              minLength={1}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-muted/50 border-border text-foreground"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-muted/50 border-border text-foreground"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="bg-lime-500 text-primary-foreground hover:bg-lime-400"
            disabled={passwordSaving}
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
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
                <Input
                  type="number"
                  placeholder="28"
                  className="bg-muted/50 border-border"
                  value={profileData.age || ''}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value ? Number(e.target.value) : undefined })}
                  min="1"
                  max="150"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Gender</label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground"
                  value={profileData.gender || ''}
                  onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as 'male' | 'female' | 'other' | undefined })}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Weight className="w-3 h-3" /> Weight (kg)
                </label>
                <Input
                  type="number"
                  placeholder="62"
                  className="bg-muted/50 border-border"
                  value={profileData.weight || ''}
                  onChange={(e) => setProfileData({ ...profileData, weight: e.target.value ? Number(e.target.value) : undefined })}
                  min="1"
                  max="500"
                  step="0.1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Ruler className="w-3 h-3" /> Height (cm)
                </label>
                <Input
                  type="number"
                  placeholder="168"
                  className="bg-muted/50 border-border"
                  value={profileData.height || ''}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value ? Number(e.target.value) : undefined })}
                  min="1"
                  max="300"
                  step="0.1"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Fitness Goals</label>
              <div className="flex flex-wrap gap-2">
                {fitnessGoalsOptions.map(goal => (
                  <Badge
                    key={goal}
                    variant={profileData.fitnessGoals?.includes(goal) ? "default" : "secondary"}
                    className={`px-3 py-1 cursor-pointer transition-colors ${
                      profileData.fitnessGoals?.includes(goal)
                        ? 'bg-ko-500/10 text-ko-500 border-ko-500/20 hover:bg-ko-500/20'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
              {profileData.fitnessGoals && profileData.fitnessGoals.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Click on goals to select them</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Medical Conditions (Optional)</label>
              <Input
                placeholder="None / Asthma / Back pain..."
                className="bg-muted/50 border-border"
                value={profileData.medicalConditions || ''}
                onChange={(e) => setProfileData({ ...profileData, medicalConditions: e.target.value })}
              />
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
                <Input
                  placeholder="Spouse / Parent / Friend"
                  className="bg-muted/50 border-border"
                  value={profileData.emergencyContact?.name || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    emergencyContact: {
                      ...profileData.emergencyContact,
                      name: e.target.value,
                      phone: profileData.emergencyContact?.phone || '',
                    }
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                    +91
                  </span>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    className="rounded-l-none bg-muted/50 border-border"
                    value={profileData.emergencyContact?.phone || ''}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      emergencyContact: {
                        ...profileData.emergencyContact,
                        name: profileData.emergencyContact?.name || '',
                        phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                      }
                    })}
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground"
            onClick={handleProfileUpdate}
            disabled={profileSaving}
          >
            {profileSaving ? 'Saving...' : 'Save Profile Details'}
          </Button>
        </div>
      </div>
    </div>
  );
}
