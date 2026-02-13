const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { phone, password, rememberMe } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }
    const result = await authService.login(phone, password, Boolean(rememberMe));
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    res.json({
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' });
    }
    const result = await authService.register(name, phone, password);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register };
