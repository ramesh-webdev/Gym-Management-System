const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const paymentsController = require('../controllers/payments.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', paymentsController.list);
router.post('/', requireRole('admin'), paymentsController.create);
router.put('/:id', requireRole('admin'), paymentsController.update);

module.exports = router;
