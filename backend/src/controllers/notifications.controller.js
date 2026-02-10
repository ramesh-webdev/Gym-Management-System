const Notification = require('../models/Notification');
const User = require('../models/User');
const notificationService = require('../services/notification.service');

/**
 * List notifications for the current user (default), or for a specific user / all (admin only).
 * GET /notifications?filter=all|unread|read&kind=...&userId= (admin: one user) &scope=all (admin: every notification)
 * By default everyone (including admin) sees only their own notifications.
 */
async function list(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const { filter = 'all', kind, limit = 50, userId, scope } = req.query;

    let query = {};
    if (scope === 'all' && isAdmin) {
      // Admin explicitly asked for all notifications in the system (e.g. Notifications Management page)
      // query stays {}
    } else if (userId && isAdmin) {
      query.user = userId;
    } else {
      // Default: current user's notifications only (so admin sees their own inbox, not everyone's)
      query.user = req.user.id;
    }

    if (filter === 'unread') query.isRead = false;
    if (filter === 'read') query.isRead = true;
    if (kind) query.kind = kind;
    if (req.query.type) query.type = req.query.type;

    const notifications = await Notification.find(query)
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 100))
      .lean();

    const list = notifications.map((n) => {
      const userObj = n.user;
      const userId = userObj?._id?.toString() || userObj?.toString() || n.user;
      const out = {
        id: n._id.toString(),
        userId,
        recipientName: userObj?.name ?? null,
        recipientRole: userObj?.role ?? null,
        title: n.title,
        message: n.message,
        type: n.type,
        kind: n.kind || 'general',
        isRead: n.isRead,
        link: n.link || null,
        metadata: n.metadata || null,
        createdAt: n.createdAt ? n.createdAt.toISOString() : null,
      };
      return out;
    });

    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get unread count for current user (or for a specific user if admin).
 * GET /notifications/unread-count?userId= (optional, admin only)
 */
async function getUnreadCount(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = isAdmin && req.query.userId ? req.query.userId : req.user.id;
    const count = await Notification.countDocuments({ user: userId, isRead: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

/**
 * Create one or many notifications. Admin only.
 * POST /notifications
 * Body: { title, message, type?, kind?, link?, userId } for one, or { title, message, type?, kind?, link?, recipients } for many.
 * recipients: 'all' | 'admins' | 'members' | 'trainers' | string[] (user ids)
 */
async function create(req, res, next) {
  try {
    const { title, message, type = 'info', kind = 'announcement', link, userId, recipients } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const opts = { title, message, type, kind, link: link || null };

    if (userId) {
      const one = await notificationService.createNotification({ ...opts, userId });
      return res.status(201).json(one);
    }

    if (recipients === 'all' || recipients === 'members' || recipients === 'trainers' || recipients === 'admins') {
      const role = recipients === 'all' ? null : recipients.replace(/s$/, ''); // members -> member, trainers -> trainer, admins -> admin
      const users = await User.find(role ? { role, status: 'active' } : { status: 'active' })
        .select('_id')
        .lean();
      const ids = users.map((u) => u._id.toString());
      if (ids.length === 0) {
        return res.status(400).json({ message: 'No users found for the selected recipients' });
      }
      const created = await notificationService.createForUsers(ids, opts);
      return res.status(201).json({ created: created.length, notifications: created });
    }

    if (Array.isArray(recipients) && recipients.length > 0) {
      const created = await notificationService.createForUsers(recipients, opts);
      return res.status(201).json({ created: created.length, notifications: created });
    }

    return res.status(400).json({ message: 'Provide userId or recipients (all, members, trainers, admins, or array of user ids)' });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark a notification as read. Only the recipient (owner) can mark read—admin cannot mark other users' notifications.
 * PATCH /notifications/:id/read
 */
async function markRead(req, res, next) {
  try {
    const notif = await Notification.findById(req.params.id).lean();
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notif.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only mark your own notifications as read' });
    }
    await Notification.updateOne({ _id: req.params.id }, { isRead: true });
    res.json({ id: req.params.id, isRead: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark all notifications as read for the current user.
 * PATCH /notifications/read-all
 */
async function markAllRead(req, res, next) {
  try {
    const result = await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a notification. Only the recipient (owner) can delete—admin cannot delete other users' notifications.
 * DELETE /notifications/:id
 */
async function remove(req, res, next) {
  try {
    const notif = await Notification.findById(req.params.id).lean();
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notif.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own notifications' });
    }
    await Notification.deleteOne({ _id: req.params.id });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * Seed "membership expiring soon" notifications for members whose expiry is in 2–7 days.
 * Admin only. Call from dashboard load or manually.
 * GET /notifications/seed-expiring
 */
async function seedExpiringMemberships(req, res, next) {
  try {
    const now = new Date();
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const inTwoDays = new Date(now);
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    const members = await User.find({
      role: 'member',
      membershipExpiry: { $gte: inTwoDays, $lte: inSevenDays },
    })
      .select('_id name membershipExpiry')
      .lean();
    let created = 0;
    for (const m of members) {
      const expiry = new Date(m.membershipExpiry);
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      await notificationService.notifyMember(m._id.toString(), {
        title: 'Membership Expiring Soon',
        message: `Your membership expires in ${daysLeft} day(s) (${expiry.toLocaleDateString()}). Renew to continue access.`,
        type: 'warning',
        kind: 'membership',
        link: '/member/membership',
        metadata: { memberId: m._id.toString(), expiry: expiry.toISOString() },
      });
      created += 1;
    }
    res.json({ message: `Created ${created} membership expiring notification(s).`, created });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getUnreadCount,
  create,
  markRead,
  markAllRead,
  remove,
  seedExpiringMemberships,
};
