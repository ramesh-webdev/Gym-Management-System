const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/overview', authMiddleware, requireRole('admin'), dashboardController.getOverview);

module.exports = router;
