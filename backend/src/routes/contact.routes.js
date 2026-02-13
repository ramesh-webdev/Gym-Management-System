const express = require('express');
const contactController = require('../controllers/contact.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to submit a message
router.post('/', contactController.createMessage);

// Protected admin routes
router.get('/', authMiddleware, requireRole('admin'), contactController.getAllMessages);
router.patch('/:id', authMiddleware, requireRole('admin'), contactController.updateMessageStatus);
router.delete('/:id', authMiddleware, requireRole('admin'), contactController.deleteMessage);

module.exports = router;
