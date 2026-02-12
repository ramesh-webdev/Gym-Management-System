import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Utensils,
  ChefHat,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface TrainerSidebarProps {
  currentPage: string;
  onLogout: () => void;
}

const menuItems = [
  { id: 'trainer-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/trainer/dashboard' },
  { id: 'trainer-diet-plans', label: 'Diet Plans', icon: Utensils, path: '/trainer/diet-plans' },
  { id: 'trainer-recipes', label: 'Recipes', icon: ChefHat, path: '/trainer/recipes' },
  { id: 'trainer-notifications', label: 'Notifications', icon: Bell, path: '/trainer/notifications' },
  { id: 'trainer-settings', label: 'Account Security', icon: Shield, path: '/trainer/settings' },
];

export function TrainerSidebar({ onLogout }: TrainerSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-background border-r border-border z-40 transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border px-3">
          <button
            onClick={() => navigate('/trainer/dashboard')}
            className="flex items-center justify-center w-full"
          >
            {isCollapsed ? (
              <img
                src="/favicon_logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <img
                src="/Logo.png"
                alt="Logo"
                className="h-16 object-contain"
              />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                  isActive
                    ? 'bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <ThemeToggle />
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
