const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }
    const result = await authService.login(phone, password);
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    res.json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
