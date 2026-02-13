import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  getUnreadCount,
  listNotifications,
  markNotificationRead,
} from '@/api/notifications';
import type { Notification } from '@/types';
import { formatDateTime } from '@/utils/date';

interface TrainerHeaderProps {
  userName?: string;
  notificationsPath: string;
}

export function TrainerHeader({ userName = 'Trainer', notificationsPath }: TrainerHeaderProps) {
  const navigate = useNavigate();
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
      const res = await listNotifications({ page: 1, limit: 10 });
      setNotifications(res.data);
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
    setDropdownOpen(false);
    if (n.link) {
      navigate(n.link);
    } else {
      navigate(notificationsPath);
    }
  };

  return (
    <header className="h-14 lg:h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-end gap-2 px-4 sticky top-0 z-30">
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
                  <p className="text-foreground text-sm font-medium">{notification.title}</p>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-muted-foreground/50 text-xs mt-1">
                    {notification.createdAt
                      ? formatDateTime(notification.createdAt)
                      : ''}
                  </p>
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
                navigate(notificationsPath);
              }}
              className="w-full bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700 hover:bg-ko-500/10"
            >
              View All Notifications
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[120px]">
        {userName}
      </span>
      <div className="w-8 h-8 rounded-full bg-ko-500/20 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-ko-500" />
      </div>
    </header>
  );
}
