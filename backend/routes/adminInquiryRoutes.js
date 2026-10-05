const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/inquiries routes with JWT authentication
router.use(protect);

// GET /api/admin/inquiries - List inquiries with filtering, search, and metrics
router.get('/', inquiryController.getAdminInquiries);

// GET /api/admin/inquiries/:id - Detail view of a single inquiry
router.get('/:id', inquiryController.getAdminInquiryById);

// PATCH /api/admin/inquiries/:id/status - Update lead status
router.patch('/:id/status', inquiryController.updateInquiryStatus);

// PATCH /api/admin/inquiries/:id/read - Mark read or unread
router.patch('/:id/read', inquiryController.updateInquiryRead);

// PATCH /api/admin/inquiries/:id/notes - Save private admin notes
router.patch('/:id/notes', inquiryController.updateInquiryNotes);

// DELETE /api/admin/inquiries/:id - Permanently remove inquiry
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;
