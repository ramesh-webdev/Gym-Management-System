const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const membershipPlansRoutes = require('./membership-plans.routes');
const productsRoutes = require('./products.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/membership-plans', membershipPlansRoutes);
router.use('/products', productsRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
