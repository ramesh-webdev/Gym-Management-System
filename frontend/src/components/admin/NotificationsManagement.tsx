import { useState } from 'react';
import {
  Bell,
  Check,
  Trash2,
  Mail,
  AlertTriangle,
  Info,
  Send,
} from 'lucide-react';
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
import { mockNotifications } from '@/data/mockData';

export function NotificationsManagement() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-lime-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            className="border-border text-foreground hover:bg-muted/50"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-lime-500 text-primary-foreground hover:bg-lime-400">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Send Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Recipients</label>
                  <select className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-foreground">
                    <option>All Members</option>
                    <option>Active Members</option>
                    <option>Expired Members</option>
                    <option>Specific Member</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
                  <Input className="bg-muted/50 border-border text-foreground" placeholder="Notification subject..." />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                  <Textarea
                    className="bg-muted/50 border-border text-foreground resize-none"
                    rows={4}
                    placeholder="Type your message..."
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
                  <div className="flex gap-3">
                    {['Low', 'Normal', 'High'].map((priority) => (
                      <button
                        key={priority}
                        className="px-4 py-2 rounded-lg bg-muted/50 border border-border text-muted-foreground hover:border-lime-500/50 hover:text-foreground transition-colors"
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400">
                  Send Notification
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Notifications', value: notifications.length, icon: Bell },
          { label: 'Unread', value: unreadCount, icon: Mail, highlight: true },
          { label: 'Sent Today', value: '12', icon: Send },
        ].map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              stat.highlight
                ? 'bg-lime-500/5 border-lime-500/20'
                : 'bg-card/50 border-border'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.highlight ? 'text-lime-500' : 'text-muted-foreground'}`} />
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
            <p className={`font-display text-3xl font-bold ${stat.highlight ? 'text-lime-500' : 'text-foreground'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-lime-500 text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-lime-500 text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl border transition-colors ${
              notification.isRead
                ? 'bg-card/30 border-border'
                : 'bg-lime-500/5 border-lime-500/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className={`font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                    <p className="text-muted-foreground text-xs mt-2">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="text-muted-foreground hover:text-lime-500 hover:bg-lime-500/10"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
