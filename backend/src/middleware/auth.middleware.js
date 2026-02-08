const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

/**
 * Verify JWT and attach user to req.user (plain object, no passwordHash).
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const { passwordHash, ...userSafe } = user;
    req.user = { ...userSafe, id: user._id.toString() };
    if (req.user.createdAt) req.user.createdAt = req.user.createdAt.toISOString ? req.user.createdAt.toISOString() : req.user.createdAt;
    if (req.user.updatedAt) req.user.updatedAt = req.user.updatedAt.toISOString ? req.user.updatedAt.toISOString() : req.user.updatedAt;
    if (req.user.lastLogin) req.user.lastLogin = req.user.lastLogin.toISOString ? req.user.lastLogin.toISOString() : req.user.lastLogin;
    if (req.user.membershipExpiry) req.user.membershipExpiry = req.user.membershipExpiry.toISOString ? req.user.membershipExpiry.toISOString() : req.user.membershipExpiry;
    if (req.user.joinDate) req.user.joinDate = req.user.joinDate.toISOString ? req.user.joinDate.toISOString() : req.user.joinDate;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    next(err);
  }
}

/**
 * Optional auth: attach user if token present, do not 401 if missing.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return next();
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId).lean();
    if (!user) return next();
    const { passwordHash, ...userSafe } = user;
    req.user = { ...userSafe, id: user._id.toString() };
    if (req.user.createdAt) req.user.createdAt = req.user.createdAt.toISOString ? req.user.createdAt.toISOString() : req.user.createdAt;
    if (req.user.lastLogin) req.user.lastLogin = req.user.lastLogin.toISOString ? req.user.lastLogin.toISOString() : req.user.lastLogin;
    if (req.user.membershipExpiry) req.user.membershipExpiry = req.user.membershipExpiry.toISOString ? req.user.membershipExpiry.toISOString() : req.user.membershipExpiry;
    if (req.user.joinDate) req.user.joinDate = req.user.joinDate.toISOString ? req.user.joinDate.toISOString() : req.user.joinDate;
    next();
  } catch {
    next();
  }
}

/**
 * Require role to be one of the given roles.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authMiddleware, optionalAuth, requireRole };
