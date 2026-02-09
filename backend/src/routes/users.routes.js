const express = require('express');
const usersController = require('../controllers/users.controller');
const staffRoutes = require('./staff.routes');

const router = express.Router();

const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, usersController.getMe);
router.put('/me/password', authMiddleware, usersController.changePassword);
router.patch('/me', authMiddleware, usersController.updateMe);
router.use('/staff', staffRoutes);

module.exports = router;
