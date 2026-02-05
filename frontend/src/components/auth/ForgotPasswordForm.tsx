import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/95 to-background" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ko-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ko-500/5 rounded-full blur-[150px]" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Login
      </button>

      {/* Form Card */}
      <div className="relative w-full max-w-md mx-4">
        <div className="p-8 rounded-2xl bg-card/80 backdrop-blur-xl border border-border">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/Logo.png"
              alt="KO Fitness Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground">
              Enter your mobile number to receive reset instructions
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-ko-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Check Your SMS
              </h2>
              <p className="text-muted-foreground mb-6">
                We've sent password reset instructions to{' '}
                <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">{mobile}</span>
              </p>
              <Button
                onClick={() => navigate('login')}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-lime-500 h-12 pl-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700 font-semibold h-12 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}

          {/* Help Text */}
          {!isSubmitted && (
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                Remember your password?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
