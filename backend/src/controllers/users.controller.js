const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { parsePagination, sendPaginated } = require('../utils/pagination');

async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    // For members, fetch with populated plan so we always return plan name and id
    if (req.user.role === 'member') {
      const member = await User.findById(req.user.id)
        .populate('membershipPlan', 'name duration')
        .lean();
      if (member) {
        const { passwordHash, membershipPlan, ...rest } = member;
        const out = { ...rest, id: member._id.toString() };
        if (out.createdAt) out.createdAt = member.createdAt?.toISOString?.() ?? out.createdAt;
        if (out.updatedAt) out.updatedAt = member.updatedAt?.toISOString?.() ?? out.updatedAt;
        if (out.lastLogin) out.lastLogin = member.lastLogin?.toISOString?.() ?? out.lastLogin;
        if (out.membershipExpiry) out.membershipExpiry = member.membershipExpiry?.toISOString?.() ?? out.membershipExpiry;
        if (out.joinDate) out.joinDate = member.joinDate?.toISOString?.() ?? out.joinDate;
        out.membershipPlan = membershipPlan ? String(membershipPlan._id) : null;
        out.membershipType = membershipPlan?.name ?? rest.membershipType ?? null;
        return res.json(out);
      }
    }
    res.json(req.user);
  } catch (err) {
    next(err);
  }
}

/**
 * Change password for the authenticated user.
 * Body: currentPassword, newPassword.
 */
async function changePassword(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Update current user's profile (self-service).
 * Body: name?, avatar?, onboardingData?, isOnboarded?.
 * Members can update their own profile and onboarding data.
 */
async function updateMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const { name, avatar, onboardingData, isOnboarded } = req.body;
    if (name !== undefined) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (onboardingData !== undefined) {
      user.onboardingData = onboardingData;
    }
    if (isOnboarded !== undefined && typeof isOnboarded === 'boolean') {
      user.isOnboarded = isOnboarded;
    }
    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * List all users (id, name, role) for admin only. Used e.g. for notification recipient filter.
 * Query: page (default 1), limit (default 200, max 500).
 */
async function listForAdmin(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 200, maxLimit: 500 });
    const [users, total] = await Promise.all([
      User.find({ status: 'active' })
        .select('_id name role')
        .sort({ role: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ status: 'active' }),
    ]);
    const list = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      role: u.role,
    }));
    sendPaginated(res, list, total, page, limit);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, changePassword, updateMe, listForAdmin };
