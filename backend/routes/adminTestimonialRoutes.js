const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/testimonials routes with JWT authentication
router.use(protect);

// ADMIN: Get all testimonials + metrics
router.get('/', testimonialController.getAdminTestimonials);

// ADMIN: Get single testimonial by ID
router.get('/:id', testimonialController.getAdminTestimonialById);

// ADMIN: Create new testimonial
router.post('/', testimonialController.createTestimonial);

// ADMIN: Update existing testimonial
router.put('/:id', testimonialController.updateTestimonial);

// ADMIN: Quick toggle publish status
router.patch('/:id/toggle-publish', testimonialController.togglePublish);

// ADMIN: Delete testimonial
router.delete('/:id', testimonialController.deleteTestimonial);

module.exports = router;
