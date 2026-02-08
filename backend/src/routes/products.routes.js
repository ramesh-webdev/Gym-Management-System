const express = require('express');
const productsController = require('../controllers/products.controller');
const { optionalAuth, authMiddleware, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', optionalAuth, productsController.list);
router.get('/:id', productsController.getById);

// Admin only
router.post('/upload', authMiddleware, requireRole('admin'), upload.single('image'), productsController.uploadImage);
router.post('/', authMiddleware, requireRole('admin'), productsController.create);
router.put('/:id', authMiddleware, requireRole('admin'), productsController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), productsController.remove);

module.exports = router;
