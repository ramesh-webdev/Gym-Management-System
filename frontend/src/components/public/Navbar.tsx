import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Programs', href: '/programs' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Trainers', href: '/trainers' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <img
              src="/Logo.png"
              alt="KO Fitness Logo"
              className="h-16 w-auto group-hover:scale-110 transition-transform"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={`relative text-sm font-medium transition-colors group ${
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-ko-500 to-ko-600 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-border text-foreground hover:bg-muted hover:text-foreground font-medium"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700 font-semibold px-6"
            >
              Join Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border py-6">
          <nav className="flex flex-col items-center gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-lg font-medium transition-colors py-2 ${
                  location.pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-3 mt-4 w-full px-8">
              <div className="flex justify-center py-2">
                <ThemeToggle />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full border-border text-foreground hover:bg-muted"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700 font-semibold"
              >
                Join Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
