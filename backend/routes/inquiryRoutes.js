const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { inquiryLimiter } = require('../middleware/rateLimiter');

// PUBLIC: Submit inquiry only (POST /api/inquiries)
// NOTE: There is NO public GET /api/inquiries to protect client privacy
router.post('/', inquiryLimiter, inquiryController.submitInquiry);

module.exports = router;
