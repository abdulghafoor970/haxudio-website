const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/services routes with JWT admin authentication
router.use(protect);

// ADMIN: Get all services
router.get('/', serviceController.getAdminServices);

// ADMIN: Get single service by ID
router.get('/:id', serviceController.getAdminServiceById);

// ADMIN: Create new service
router.post('/', serviceController.createService);

// ADMIN: Update existing service
router.put('/:id', serviceController.updateService);

// ADMIN: Quick toggle publish
router.patch('/:id/toggle-publish', serviceController.togglePublish);

// ADMIN: Delete service
router.delete('/:id', serviceController.deleteService);

module.exports = router;
