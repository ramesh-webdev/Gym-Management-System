const express = require('express');
const recipesController = require('../controllers/recipes.controller');
const { authMiddleware, requireRole, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes (optional auth - admin sees all, public sees active only)
router.get('/', optionalAuth, recipesController.list);
router.get('/:id', optionalAuth, recipesController.getById);

// Admin and Trainer routes
router.post('/', authMiddleware, requireRole('admin', 'trainer'), recipesController.create);
router.put('/:id', authMiddleware, requireRole('admin', 'trainer'), recipesController.update);
router.delete('/:id', authMiddleware, requireRole('admin', 'trainer'), recipesController.remove);

module.exports = router;
