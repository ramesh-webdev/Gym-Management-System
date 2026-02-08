const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info', enum: ['info', 'success', 'warning', 'error', 'payment'] },
  isRead: { type: Boolean, default: false },
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
      return ret;
    },
  },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
