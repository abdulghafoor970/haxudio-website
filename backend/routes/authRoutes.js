const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public route: Admin login with dedicated brute-force rate limiter
router.post('/login', authLimiter, login);

// Public/Informational route: Admin logout
router.post('/logout', logout);

// Protected route: Current admin profile
router.get('/me', protect, getMe);

module.exports = router;
