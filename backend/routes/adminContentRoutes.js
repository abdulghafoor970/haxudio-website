const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/content routes
router.use(protect);

// ADMIN: Get all website content items across all pages
router.get('/', contentController.getAdminAllContent);

// ADMIN: Get all sections for a specific page
router.get('/:page', contentController.getAdminPageContent);

// ADMIN: Update or create a section's content (PUT /api/admin/content/:page/:section)
router.put('/:page/:section', contentController.updateSectionContent);

// ADMIN: Delete a section
router.delete('/:page/:section', contentController.deleteSectionContent);

module.exports = router;
