const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// PUBLIC: Get active content for a specific page (e.g., /api/content/home)
router.get('/:page', contentController.getPublicPageContent);

module.exports = router;
