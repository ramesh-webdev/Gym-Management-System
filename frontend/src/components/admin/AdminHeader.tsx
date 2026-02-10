import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  getUnreadCount,
  listNotifications,
  markNotificationRead,
} from '@/api/notifications';
import type { Notification } from '@/types';

interface AdminHeaderProps {
  onLogout: () => void;
  userName?: string;
}

export function AdminHeader({ onLogout, userName = 'Admin User' }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const list = await listNotifications({ limit: 10 });
      setNotifications(list);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (dropdownOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [dropdownOpen, fetchNotifications, fetchUnreadCount]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
    if (n.link) {
      navigate(n.link);
    } else {
      navigate('/admin/notifications');
    }
    setDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search members, trainers, payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-ko-500 pl-10 h-10"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted" />

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-ko-500 to-ko-600 text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card border-border">
            <div className="p-3 border-b border-border">
              <h4 className="font-display text-lg font-bold text-foreground">Notifications</h4>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleNotificationClick(notification)
                    }
                    className={`p-3 border-b border-border hover:bg-muted cursor-pointer ${
                      !notification.isRead ? 'bg-ko-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.type === 'success'
                            ? 'bg-gradient-to-r from-ko-500 to-ko-600'
                            : notification.type === 'warning'
                              ? 'bg-yellow-500'
                              : notification.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                        }`}
                      />
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-muted-foreground/50 text-xs mt-1">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString()
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/admin/notifications');
                }}
                className="w-full bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700 hover:bg-ko-500/10"
              >
                View All Notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 text-foreground hover:bg-muted"
            >
              <div className="w-8 h-8 rounded-full bg-ko-500/20 flex items-center justify-center">
                <User className="w-4 h-4 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">{userName}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings')}
              className="text-foreground hover:bg-muted cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings')}
              className="text-foreground hover:bg-muted cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-red-500 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
