const express = require('express');
const usersController = require('../controllers/users.controller');
const staffRoutes = require('./staff.routes');

const router = express.Router();

router.get('/me', require('../middleware/auth.middleware').authMiddleware, usersController.getMe);
router.use('/staff', staffRoutes);

module.exports = router;
