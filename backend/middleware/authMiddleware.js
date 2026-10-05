const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/Admin');

/**
 * Protect routes - verifies JWT in Authorization header: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header (format: "Bearer <token>")
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
          code: 'TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.',
        code: 'TOKEN_INVALID',
      });
    }

    // Ensure admin user still exists and is active
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'The administrator account associated with this token no longer exists.',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This administrator account has been deactivated.',
      });
    }

    // Attach admin to request object
    req.admin = admin;
    req.user = admin;

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.',
    });
  }
};

/**
 * Restrict access to specific roles (e.g. 'superadmin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
