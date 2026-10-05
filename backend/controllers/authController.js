const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');

/**
 * @desc    Admin login and get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Validate request input types and presence
    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password in valid format.',
      });
    }

    // Find admin by lowercase email and explicitly include password for verification
    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This administrator account is currently inactive.',
      });
    }

    // Verify hashed password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login timestamp without re-running password hash validation
    admin.lastLoginAt = new Date();
    await admin.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        active: admin.isActive,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in admin details
 * @route   GET /api/auth/me
 * @access  Private (Admin only)
 */
const getMe = async (req, res, next) => {
  try {
    // req.admin is attached by protect middleware
    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        active: req.admin.isActive,
        createdAt: req.admin.createdAt,
        updatedAt: req.admin.updatedAt,
        lastLoginAt: req.admin.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin logout
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
const logout = async (req, res) => {
  // Stateless JWT logout is handled on client by clearing the stored token.
  // This endpoint confirms logout success and allows clearing any session cookies if used.
  return res.status(200).json({
    success: true,
    message: 'Successfully logged out.',
  });
};

module.exports = {
  login,
  getMe,
  logout,
};
