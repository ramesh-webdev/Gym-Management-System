const express = require('express');
const membershipPlansController = require('../controllers/membership-plans.controller');
const { optionalAuth, authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// List: no auth = active only (public pricing). With admin auth = all plans.
router.get('/', optionalAuth, membershipPlansController.list);
router.get('/:id', membershipPlansController.getById);

// Admin only
router.post('/', authMiddleware, requireRole('admin'), membershipPlansController.create);
router.put('/:id', authMiddleware, requireRole('admin'), membershipPlansController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), membershipPlansController.remove);

module.exports = router;
