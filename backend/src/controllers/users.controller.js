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

module.exports = { getMe };
