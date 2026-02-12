const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const paymentsController = require('../controllers/payments.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', paymentsController.list);
router.post('/create-order', paymentsController.createOrder); // Member: Razorpay-style order
router.post('/verify', paymentsController.verify);           // After checkout (auto-approve for now)
router.post('/cancel-order', paymentsController.cancelOrder); // Member: cancel pending order (e.g. closed Razorpay without paying)
router.post('/', requireRole('admin'), paymentsController.create);
router.put('/:id', requireRole('admin'), paymentsController.update);

module.exports = router;
