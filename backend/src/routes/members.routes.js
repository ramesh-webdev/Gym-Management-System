const express = require('express');
const membersController = require('../controllers/members.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware, requireRole('admin'));

router.get('/', membersController.list);
router.get('/:id', membersController.getById);
router.post('/', membersController.create);

router.put('/:id', membersController.update);
router.delete('/:id', membersController.deleteMember);


module.exports = router;
