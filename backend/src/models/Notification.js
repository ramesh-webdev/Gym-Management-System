const mongoose = require('mongoose');

/** Kinds of notifications for filtering and display. */
const NOTIFICATION_KINDS = [
  'general',       // Generic info/success/warning/error
  'membership',    // New member, expiry, renewed
  'diet_plan',     // Diet plan assigned/updated
  'assignment',    // Trainer assigned to member
  'payment',       // Payment due, received, overdue
  'announcement',  // Broadcast from admin
];

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  /** Display severity: info, success, warning, error, payment */
  type: { type: String, default: 'info', enum: ['info', 'success', 'warning', 'error', 'payment'] },
  /** Category for filtering: general, membership, diet_plan, assignment, payment, announcement */
  kind: { type: String, default: 'general', enum: NOTIFICATION_KINDS },
  isRead: { type: Boolean, default: false },
  /** Optional link (e.g. /admin/members/123, /trainer/dashboard) */
  link: { type: String, default: null },
  /** Optional metadata: memberId, planId, paymentId, etc. */
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      ret.userId = ret.user?.toString?.() || ret.user;
      delete ret._id;
      delete ret.__v;
      delete ret.user;
      if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
      if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
      return ret;
    },
  },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
module.exports.NOTIFICATION_KINDS = NOTIFICATION_KINDS;
