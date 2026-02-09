const express = require('express');
const dietPlansController = require('../controllers/diet-plans.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), dietPlansController.list);
router.get('/my-plan', authMiddleware, dietPlansController.getMyPlan); // Member self-service
router.get('/:id', authMiddleware, requireRole('admin'), dietPlansController.getById);
router.post('/', authMiddleware, requireRole('admin'), dietPlansController.create);
router.put('/:id', authMiddleware, requireRole('admin'), dietPlansController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), dietPlansController.remove);

module.exports = router;
