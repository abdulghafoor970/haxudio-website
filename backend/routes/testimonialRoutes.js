const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

// PUBLIC: Get all published testimonials
router.get('/', testimonialController.getPublicTestimonials);

module.exports = router;
