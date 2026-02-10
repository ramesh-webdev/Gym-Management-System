const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const notificationsController = require('../controllers/notifications.controller');

const router = express.Router();

router.use(authMiddleware);

// Unread count (any authenticated user)
router.get('/unread-count', notificationsController.getUnreadCount);

// Seed expiring membership notifications (admin only)
router.get('/seed-expiring', requireRole('admin'), notificationsController.seedExpiringMemberships);

// Mark all as read (must be before /:id)
router.patch('/read-all', notificationsController.markAllRead);

// List: own for member/trainer; all or filtered for admin
router.get('/', notificationsController.list);

// Create: admin only (broadcast / single)
router.post('/', requireRole('admin'), notificationsController.create);

// Mark one as read
router.patch('/:id/read', notificationsController.markRead);

// Delete one
router.delete('/:id', notificationsController.remove);

module.exports = router;
