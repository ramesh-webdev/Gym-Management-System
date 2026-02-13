const express = require('express');
const testimonialsController = require('../controllers/testimonials.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', testimonialsController.list);
router.get('/:id', testimonialsController.getById);
router.post('/', authMiddleware, requireRole('admin'), testimonialsController.create);
router.patch('/:id', authMiddleware, requireRole('admin'), testimonialsController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), testimonialsController.remove);

module.exports = router;
