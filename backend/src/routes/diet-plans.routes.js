const express = require('express');
const dietPlansController = require('../controllers/diet-plans.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin and Trainer routes
router.get('/', authMiddleware, requireRole('admin', 'trainer'), dietPlansController.list);
router.get('/my-plan', authMiddleware, dietPlansController.getMyPlan); // Member self-service
router.get('/:id', authMiddleware, requireRole('admin', 'trainer'), dietPlansController.getById);
router.post('/', authMiddleware, requireRole('admin', 'trainer'), dietPlansController.create);
router.put('/:id', authMiddleware, requireRole('admin', 'trainer'), dietPlansController.update);
router.delete('/:id', authMiddleware, requireRole('admin', 'trainer'), dietPlansController.remove);

module.exports = router;
