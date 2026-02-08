const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

async function login(phone, password) {
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
  const accessToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
  const response = { ...userSafe, id: user._id.toString() };
  if (response.createdAt) response.createdAt = response.createdAt.toISOString ? response.createdAt.toISOString() : response.createdAt;
  if (response.updatedAt) response.updatedAt = response.updatedAt.toISOString ? response.updatedAt.toISOString() : response.updatedAt;
  if (response.lastLogin) response.lastLogin = new Date().toISOString();
  if (response.membershipExpiry) response.membershipExpiry = response.membershipExpiry.toISOString ? response.membershipExpiry.toISOString() : response.membershipExpiry;
  if (response.joinDate) response.joinDate = response.joinDate.toISOString ? response.joinDate.toISOString() : response.joinDate;
  return { success: true, user: response, accessToken };
}

module.exports = { login };
