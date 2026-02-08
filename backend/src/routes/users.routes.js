const express = require('express');
const usersController = require('../controllers/users.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/me', authMiddleware, usersController.getMe);

module.exports = router;
