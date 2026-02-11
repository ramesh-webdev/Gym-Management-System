const express = require('express');
const trainersController = require('../controllers/trainers.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Trainer routes (authenticated trainer) - MUST come before parameterized routes
router.get('/my-clients', authMiddleware, requireRole('trainer'), trainersController.getMyClients);
router.get('/my-profile', authMiddleware, requireRole('trainer'), trainersController.getMyProfile);
router.get('/my-diet-plans', authMiddleware, requireRole('trainer'), trainersController.getMyClientsDietPlans);
router.get('/clients/:clientId', authMiddleware, requireRole('trainer'), trainersController.getClientDetails);

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), trainersController.list);
router.get('/:id', authMiddleware, requireRole('admin'), trainersController.getById);
router.post('/', authMiddleware, requireRole('admin'), trainersController.create);
router.put('/:id', authMiddleware, requireRole('admin'), trainersController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), trainersController.remove);

module.exports = router;
