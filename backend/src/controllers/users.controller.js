const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function getMe(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
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
 */
async function listForAdmin(req, res, next) {
  try {
    const users = await User.find({ status: 'active' })
      .select('_id name role')
      .sort({ role: 1, name: 1 })
      .lean();
    const list = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      role: u.role,
    }));
    res.json(list);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, changePassword, updateMe, listForAdmin };
