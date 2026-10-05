const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// PUBLIC: Get public business settings & contact details (safe read-only)
router.get('/public', settingsController.getPublicSettings);

module.exports = router;
