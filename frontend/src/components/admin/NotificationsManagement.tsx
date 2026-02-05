import { useState } from 'react';
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
import { mockNotifications } from '@/data/mockData';
import type { Notification } from '@/types';

export function NotificationsManagement() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  // Form state
  const [notificationType, setNotificationType] = useState<string>('info');
  const [recipients, setRecipients] = useState<string>('all');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new notification
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: title.trim(),
      message: message.trim(),
      type: notificationType as 'info' | 'success' | 'warning' | 'error',
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    
    // Reset form
    setTitle('');
    setMessage('');
    setNotificationType('info');
    setRecipients('all');
    setIsComposeOpen(false);
    setIsSubmitting(false);
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
                {/* Notification Type */}
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

                {/* Recipients */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Recipients
                  </label>
                  <Select value={recipients} onValueChange={setRecipients}>
                    <SelectTrigger className="w-full h-10 bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="active">Active Members</SelectItem>
                      <SelectItem value="expired">Expired Members</SelectItem>
                      <SelectItem value="specific">Specific Member</SelectItem>
                      <SelectItem value="trainers">All Trainers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
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

                {/* Message */}
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

                {/* Send Button */}
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

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl border transition-colors ${
              notification.isRead
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
                        className="text-muted-foreground hover:text-ko-500 hover:bg-ko-500/10"
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
