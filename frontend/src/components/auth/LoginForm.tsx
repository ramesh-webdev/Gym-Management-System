import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginFormProps {
  onLogin: (mobile: string, password: string, role: 'admin' | 'member' | 'trainer', name?: string, isOnboarded?: boolean) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isSignup) {
      // Mock signup logic
      // In a real app, this would be an API call
      // For demo, we just log them in
      onLogin(mobile, password, 'member', name, false);
    } else {
      // Demo login logic
      if (mobile.endsWith('0')) { // Admin: 9876543210
        onLogin(mobile, password, 'admin');
      } else if (mobile.endsWith('1')) { // Trainer: 9876543221
        onLogin(mobile, password, 'trainer');
      } else {
        onLogin(mobile, password, 'member');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background and Decorative Elements - Keep current logic */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/95 to-background" />
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ko-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ko-500/5 rounded-full blur-[150px]" />

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      <div className="relative w-full max-w-md mx-4">
        <div className="p-8 rounded-2xl bg-card/80 backdrop-blur-xl border border-border mt-16 mb-8">
          <div className="text-center mb-8">
            <img
              src="/Logo.png"
              alt="KO Fitness Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignup ? 'Join KO Fitness today' : 'Sign in to access your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-ko-500 h-12"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(value);
                  }}
                  required
                  pattern="[0-9]{10}"
                  className="rounded-l-none bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-ko-500 h-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-ko-500 h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-border data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400 font-semibold h-12 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                isSignup ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-semibold bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700 transition-colors"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo Credentials (click to auto-fill)
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => { setMobile('9876543210'); setPassword('admin123'); }}
                className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs hover:bg-ko-500/20 hover:bg-gradient-to-r hover:from-ko-500 hover:to-ko-600 hover:bg-clip-text hover:text-transparent transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setMobile('9876543212'); setPassword('member123'); }}
                className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs hover:bg-ko-500/20 hover:bg-gradient-to-r hover:from-ko-500 hover:to-ko-600 hover:bg-clip-text hover:text-transparent transition-colors"
              >
                Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
