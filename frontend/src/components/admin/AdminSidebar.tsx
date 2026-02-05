import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AdminSidebarProps {
  currentPage: string;
  onLogout: () => void;
}

const menuItems = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'admin-members', label: 'Members', icon: Users, path: '/admin/members' },
  { id: 'admin-trainers', label: 'Trainers & Staff', icon: UserCog, path: '/admin/trainers' },
  { id: 'admin-plans', label: 'Membership Plans', icon: CreditCard, path: '/admin/plans' },
  { id: 'admin-products', label: 'Products', icon: ShoppingBag, path: '/admin/products' },
  { id: 'admin-payments', label: 'Payments', icon: Receipt, path: '/admin/payments' },
  { id: 'admin-reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { id: 'admin-notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { id: 'admin-settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export function AdminSidebar({ currentPage, onLogout }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  console.log(currentPage);

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
          'fixed left-0 top-0 h-full bg-background border-r border-border z-40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border px-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center justify-center w-full"
          >
            {isCollapsed ? (
              <img
                src="/favicon_logo.png"
                alt="KO Fitness"
                className="h-10 w-10 object-contain"
              />
            ) : (
              <img
                src="/Logo.png"
                alt="KO Fitness Logo"
                className="h-16 w-auto object-contain"
              />
            )}
          </button>
        </div>

        {/* Toggle Button (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-lime-500 items-center justify-center text-primary-foreground hover:bg-lime-400 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          <div className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center' : 'px-3'
          )}>
            <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />
            {!isCollapsed && <span className="ml-3 text-sm text-muted-foreground">Theme</span>}
          </div>
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
