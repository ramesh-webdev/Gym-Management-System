import { useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, ArrowUp } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Programs', href: '/programs' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Trainers', href: '/trainers' },
    { label: 'Contact', href: '/contact' },
  ];

  const programs = [
    { label: 'Bodybuilding', href: '/programs' },
    { label: 'CrossFit', href: '/programs' },
    { label: 'Cardio', href: '/programs' },
    { label: 'Yoga', href: '/programs' },
    { label: 'Personal Training', href: '/programs' },
  ];

  const support = [
    { label: 'Help Center', href: '/contact' },
    { label: 'FAQs', href: '/contact' },
    { label: 'Privacy Policy', href: '/' },
    { label: 'Terms of Service', href: '/' },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="relative bg-background border-t border-border">
      {/* Main Footer */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group mb-6"
            >
              <img
                src="/Logo.png"
                alt="KO Fitness Logo"
                className="h-12 w-auto group-hover:scale-110 transition-transform"
              />
            </button>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Transform your body, elevate your mind. Join KO Fitness and start your
              fitness journey today with world-class facilities and expert trainers.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-gradient-to-br hover:from-ko-500 hover:to-ko-600 hover:text-primary-foreground text-muted-foreground transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-foreground mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-muted-foreground hover:text-ko-500 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-display text-lg font-bold text-foreground mb-6">
              Programs
            </h4>
            <ul className="space-y-3">
              {programs.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-muted-foreground hover:text-ko-500 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg font-bold text-foreground mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {support.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-muted-foreground hover:text-ko-500 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm text-center sm:text-left">
              © {new Date().getFullYear()} KO Fitness. All rights reserved.
            </p>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-muted-foreground hover:text-ko-500 transition-colors text-sm"
            >
              Back to Top
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-gradient-to-br hover:from-ko-500 hover:to-ko-600 hover:text-primary-foreground transition-all">
                <ArrowUp className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
