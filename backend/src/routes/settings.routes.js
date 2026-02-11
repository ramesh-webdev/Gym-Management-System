const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, settingsController.getSettings);
router.patch('/', authMiddleware, requireRole('admin'), settingsController.updateSettings);

module.exports = router;
