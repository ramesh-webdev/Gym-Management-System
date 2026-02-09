const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const membersRoutes = require('./members.routes');
const membershipPlansRoutes = require('./membership-plans.routes');
const productsRoutes = require('./products.routes');
const dietPlansRoutes = require('./diet-plans.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/members', membersRoutes);
router.use('/membership-plans', membershipPlansRoutes);
router.use('/products', productsRoutes);
router.use('/diet-plans', dietPlansRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
