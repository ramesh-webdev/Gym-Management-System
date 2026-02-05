import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  Calendar,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin-members', label: 'Members', icon: Users },
  { id: 'admin-trainers', label: 'Trainers & Staff', icon: UserCog },
  { id: 'admin-plans', label: 'Membership Plans', icon: CreditCard },
  { id: 'admin-attendance', label: 'Attendance', icon: Calendar },
  { id: 'admin-payments', label: 'Payments', icon: Receipt },
  { id: 'admin-reports', label: 'Reports', icon: BarChart3 },
  { id: 'admin-notifications', label: 'Notifications', icon: Bell },
  { id: 'admin-settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ currentPage, onNavigate, onLogout }: AdminSidebarProps) {
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
          'fixed left-0 top-0 h-full bg-background border-r border-border z-40 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-lime-500 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="font-display text-xl font-bold text-foreground">
                GYM<span className="text-lime-500">FLOW</span>
              </span>
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
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-lime-500 text-primary-foreground'
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
