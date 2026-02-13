const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getNextValue } = require('../models/Counter');
const config = require('../config/env');

async function login(phone, password, rememberMe = false) {
  const user = await User.findOne({ phone: phone.trim() }).lean();
  if (!user) {
    return { success: false, message: 'Invalid phone or password' };
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { success: false, message: 'Invalid phone or password' };
  }
  await User.updateOne({ _id: user._id }, { lastLogin: new Date() });
  const { passwordHash, ...userSafe } = user;
  const payload = { userId: user._id.toString() };
  // Remember me: 30 days (persistent). Otherwise 24h (session-like, tab close = logout).
  const expiresIn = rememberMe ? '30d' : '24h';
  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn });
  const expiresInSeconds = expiresIn === '30d' ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const response = { ...userSafe, id: user._id.toString() };
  if (response.createdAt) response.createdAt = response.createdAt.toISOString ? response.createdAt.toISOString() : response.createdAt;
  if (response.updatedAt) response.updatedAt = response.updatedAt.toISOString ? response.updatedAt.toISOString() : response.updatedAt;
  if (response.lastLogin) response.lastLogin = new Date().toISOString();
  if (response.membershipExpiry) response.membershipExpiry = response.membershipExpiry.toISOString ? response.membershipExpiry.toISOString() : response.membershipExpiry;
  if (response.joinDate) response.joinDate = response.joinDate.toISOString ? response.joinDate.toISOString() : response.joinDate;
  return { success: true, user: response, accessToken, expiresIn: expiresInSeconds };
}

/**
 * Register a new member (self-signup).
 * Returns user + token (same as login).
 */
async function register(name, phone, password) {
  const trimmedPhone = phone.trim();
  const existing = await User.findOne({ phone: trimmedPhone }).lean();
  if (existing) {
    return { success: false, message: 'A user with this phone number already exists' };
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const memberId = await getNextValue('memberId');
  const membershipId = `mem-${String(memberId).padStart(3, '0')}`;
  const user = await User.create({
    name: name.trim(),
    phone: trimmedPhone,
    passwordHash,
    role: 'member',
    status: 'active',
    membershipId,
    isOnboarded: false,
    joinDate: new Date(),
  });
  const u = user.toJSON();
  const payload = { userId: u.id };
  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
  return { success: true, user: u, accessToken };
}

module.exports = { login, register };
