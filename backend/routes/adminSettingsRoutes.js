const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/settings routes
router.use(protect);

// ADMIN: Get full settings document
router.get('/', settingsController.getAdminSettings);

// ADMIN: Update settings document
router.put('/', settingsController.updateAdminSettings);

module.exports = router;
