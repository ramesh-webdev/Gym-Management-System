const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * List all staff (admin users). Super-admin only.
 */
async function list(req, res, next) {
  try {
    const users = await User.find({ role: 'admin' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    const list = users.map((u) => {
      const { _id, ...rest } = u;
      const item = { ...rest, id: _id.toString() };
      if (item.createdAt) item.createdAt = item.createdAt.toISOString();
      if (item.updatedAt) item.updatedAt = item.updatedAt.toISOString();
      if (item.lastLogin) item.lastLogin = item.lastLogin.toISOString();
      return item;
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one staff by id. Super-admin only.
 */
async function getById(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'admin' }).lean();
    if (!user) {
      return res.status(404).json({ message: 'Staff user not found' });
    }
    const { passwordHash, _id, ...rest } = user;
    const out = { ...rest, id: _id.toString() };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.lastLogin) out.lastLogin = out.lastLogin.toISOString();
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create staff (admin user with optional permissions). Super-admin only.
 * Body: name, phone, password, permissions (array of menu ids, e.g. admin-dashboard).
 */
async function create(req, res, next) {
  try {
    const { name, phone, password, permissions } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' });
    }
    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this phone number already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const perms = Array.isArray(permissions) ? permissions : [];
    const user = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'admin',
      status: 'active',
      isSuperAdmin: false,
      permissions: perms,
      isOnboarded: true,
    });
    res.status(201).json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * Update staff. Super-admin only.
 * Body: name?, phone?, status?, permissions?, newPassword? (optional; if provided, updates password).
 */
async function update(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!user) {
      return res.status(404).json({ message: 'Staff user not found' });
    }
    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify super-admin from this screen' });
    }
    const { name, phone, status, permissions, newPassword } = req.body;
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) {
      if (phone.trim() !== user.phone) {
        const existing = await User.findOne({ phone: phone.trim() });
        if (existing) {
          return res.status(400).json({ message: 'A user with this phone number already exists' });
        }
        user.phone = phone.trim();
      }
    }
    if (status !== undefined && ['active', 'inactive', 'suspended'].includes(status)) {
      user.status = status;
    }
    if (permissions !== undefined) {
      user.permissions = Array.isArray(permissions) ? permissions : [];
    }
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update };
