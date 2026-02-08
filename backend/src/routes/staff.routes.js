const express = require('express');
const staffController = require('../controllers/staff.controller');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware, requireSuperAdmin);

router.get('/', staffController.list);
router.get('/:id', staffController.getById);
router.post('/', staffController.create);
router.put('/:id', staffController.update);

module.exports = router;
