import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Check,
  Trash2,
  Mail,
  AlertTriangle,
  Info,
  Send,
  Plus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationApi,
  createNotification as createNotificationApi,
} from '@/api/notifications';
import { formatDateTime } from '@/utils/date';
import { getStoredUser } from '@/api/auth';
import type { Notification } from '@/types';

const NOTIFICATION_KINDS = [
  { value: '', label: 'All kinds' },
  { value: 'general', label: 'General' },
  { value: 'membership', label: 'Membership' },
  { value: 'diet_plan', label: 'Diet Plan' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'payment', label: 'Payment' },
  { value: 'announcement', label: 'Announcement' },
] as const;

const NOTIFICATION_TYPES = [
  { value: '', label: 'All types' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'payment', label: 'Payment' },
] as const;

function NotificationSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border bg-card/30">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function NotificationsManagement() {
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id ?? '';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [filterKind, setFilterKind] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [notificationType, setNotificationType] = useState<string>('info');
  const [recipients, setRecipients] = useState<string>('all');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotifications({
        filter,
        limit: 100,
        scope: 'all',
        kind: filterKind || undefined,
        type: filterType || undefined,
      });
      setNotifications(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter, filterKind, filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const isOwnNotification = (n: Notification) => n.userId === currentUserId;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // keep UI unchanged on error
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // keep UI unchanged on error
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead(); // only marks current user's
      setNotifications((prev) =>
        prev.map((n) => (n.userId === currentUserId ? { ...n, isRead: true } : n))
      );
    } catch {
      // keep UI unchanged on error
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const body = {
        title: title.trim(),
        message: message.trim(),
        type: notificationType as 'info' | 'success' | 'warning' | 'error' | 'payment',
        kind: 'announcement',
        recipients: recipients as 'all' | 'members' | 'trainers' | 'admins',
      };
      await createNotificationApi(body);
      await fetchNotifications();
      setTitle('');
      setMessage('');
      setNotificationType('info');
      setRecipients('all');
      setIsComposeOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-ko-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case 'payment':
        return <Info className="w-5 h-5 text-koBlue-500" />;
      default:
        return <Info className="w-5 h-5 text-koBlue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const today = new Date().toDateString();
  const sentToday = notifications.filter(
    (n) => n.createdAt && new Date(n.createdAt).toDateString() === today
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Manage system notifications and messages</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="border-border text-foreground hover:bg-muted/50"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Notification
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Notification Type
                  </label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Recipients
                  </label>
                  <Select value={recipients} onValueChange={setRecipients}>
                    <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="members">All Members</SelectItem>
                      <SelectItem value="trainers">All Trainers</SelectItem>
                      <SelectItem value="admins">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
                    rows={4}
                    placeholder="Type your message here..."
                  />
                </div>

                <Button
                  onClick={handleSendNotification}
                  disabled={!title.trim() || !message.trim() || isSubmitting}
                  className="w-full bg-gradient-to-r from-koBlue-500 to-koBlue-600 text-primary-foreground hover:from-koBlue-600 hover:to-koBlue-700 font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && !isComposeOpen && (
        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-12" />
            </div>
          ))
        ) : (
          [
            { label: 'Total Notifications', value: notifications.length, icon: Bell },
            { label: 'Unread', value: unreadCount, icon: Mail, highlight: true },
            { label: 'Sent Today', value: sentToday, icon: Send },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${stat.highlight
                  ? 'bg-ko-500/5 border-ko-500/20'
                  : 'bg-card/50 border-border'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-ko-500' : 'text-muted-foreground'}`} />
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
              <p className={`font-display text-3xl font-bold ${stat.highlight ? 'bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent' : 'text-foreground'}`}>
                {stat.value}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Filter: Read status */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                ? 'bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-ko-500/10 text-ko-500 text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Admin filters: Kind, Type */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border bg-card/50 border-border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Kind</label>
          <Select value={filterKind || 'all'} onValueChange={(v) => setFilterKind(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/50 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {NOTIFICATION_KINDS.filter((k) => k.value).map((k) => (
                <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Type</label>
          <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[120px] h-9 bg-muted/50 border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {NOTIFICATION_TYPES.filter((t) => t.value).map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)
        ) : (
          <>
            {filteredNotifications.map((notification) => {
              const own = isOwnNotification(notification);
              const recipientLabel = notification.recipientName
                ? `${notification.recipientName}${notification.recipientRole ? ` (${notification.recipientRole})` : ''}`
                : '—';
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-colors ${notification.isRead
                      ? 'bg-card/30 border-border'
                      : 'bg-ko-500/5 border-ko-500/20'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className={`font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground" title="Recipient">
                              To: {recipientLabel}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                          <p className="text-muted-foreground text-xs mt-2">
                            {notification.createdAt
                              ? formatDateTime(notification.createdAt)
                              : ''}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {own && !notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              className="text-muted-foreground hover:text-ko-500 hover:bg-ko-500/10"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {own ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic" title="You can only mark or delete your own notifications">
                              —
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
