const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a single notification for a user.
 * @param {Object} opts - { userId, title, message, type?, kind?, link?, metadata? }
 */
async function createNotification(opts) {
  const {
    userId,
    title,
    message,
    type = 'info',
    kind = 'general',
    link = null,
    metadata = null,
  } = opts;
  if (!userId || !title || !message) return null;
  const doc = await Notification.create({
    user: userId,
    title,
    message,
    type,
    kind,
    link: link || undefined,
    metadata: metadata || undefined,
  });
  return doc.toJSON();
}

/**
 * Create the same notification for multiple users (e.g. "all admins", "all members").
 */
async function createForUsers(userIds, opts) {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];
  const { title, message, type = 'info', kind = 'general', link = null, metadata = null } = opts;
  const docs = await Notification.insertMany(
    userIds.map((uid) => ({
      user: uid,
      title,
      message,
      type,
      kind,
      link: link || undefined,
      metadata: metadata || undefined,
    }))
  );
  return docs.map((d) => d.toJSON());
}

/**
 * Get all admin user IDs (for system notifications to admins).
 */
async function getAdminUserIds() {
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id').lean();
  return admins.map((a) => a._id.toString());
}

/**
 * Notify all admins (e.g. new member registered, payment received).
 */
async function notifyAdmins(opts) {
  const ids = await getAdminUserIds();
  return createForUsers(ids, opts);
}

/**
 * Notify a member (e.g. trainer assigned, diet plan assigned).
 */
async function notifyMember(memberId, opts) {
  return createNotification({ ...opts, userId: memberId });
}

/**
 * Notify a trainer (e.g. new client assigned).
 */
async function notifyTrainer(trainerId, opts) {
  return createNotification({ ...opts, userId: trainerId });
}

module.exports = {
  createNotification,
  createForUsers,
  getAdminUserIds,
  notifyAdmins,
  notifyMember,
  notifyTrainer,
};
