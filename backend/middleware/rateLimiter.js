const rateLimit = require('express-rate-limit');

/**
 * Basic IP-based Rate Limiter
 * Limits incoming requests to prevent brute force and denial of service.
 * Configured safely for reverse proxies (Google Cloud Run / AI Studio preview).
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: false, // Disable strict proxy validation warnings in reverse-proxy environments
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Inquiries Rate Limiter
 * Restricts spam and abusive form submissions to 15 submissions per 15 minutes per IP.
 */
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: 'Too many inquiry submissions from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Dedicated Authentication / Login Rate Limiter
 * Restricts brute-force login attempts to 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
});

module.exports = {
  apiLimiter,
  inquiryLimiter,
  authLimiter,
};

