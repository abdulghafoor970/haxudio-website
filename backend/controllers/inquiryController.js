const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const { validateAndSanitizeInquiry, stripHtml } = require('../validators/inquiryValidator');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * PUBLIC: Submit an inquiry / lead
 * POST /api/inquiries
 * Accessible to public visitors with rate limiting, sanitization, and strict validation.
 */
exports.submitInquiry = async (req, res) => {
  try {
    const { isValid, errors, sanitized } = validateAndSanitizeInquiry(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Invalid inquiry submission data.',
        errors,
      });
    }

    const inquiry = await Inquiry.create({
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      company: sanitized.company,
      service: sanitized.service,
      budget: sanitized.budget,
      message: sanitized.message,
      source: sanitized.source,
      pageUrl: sanitized.pageUrl,
      status: 'new',
      isRead: false,
      adminNotes: '',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your project inquiry has been received. Our team will review your specifications and contact you within 24 hours.',
      inquiryId: inquiry._id.toString(),
    });
  } catch (err) {
    console.error('[Public Inquiry Submission Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to process your inquiry at this moment. Please try again or contact us via WhatsApp.',
    });
  }
};

/**
 * ADMIN: Get inquiries with filtering, search, sorting, and summary counts
 * GET /api/admin/inquiries
 */
exports.getAdminInquiries = async (req, res) => {
  try {
    const { status, isRead, search, sort } = req.query;

    const filter = {};

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by read/unread state
    if (isRead === 'true' || isRead === true) {
      filter.isRead = true;
    } else if (isRead === 'false' || isRead === false) {
      filter.isRead = false;
    }

    // Keyword search across key text fields
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
        { service: searchRegex },
        { message: searchRegex },
      ];
    }

    // Determine sort order
    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    // Pagination parameters (default: 20 per page, max: 100)
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Filtered count for pagination
    const filteredTotal = await Inquiry.countDocuments(filter);
    const totalPages = Math.ceil(filteredTotal / limitNum) || 1;

    const inquiries = await Inquiry.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum)
      .lean({ virtuals: true });

    // Aggregate global metrics across all inquiries for administrative awareness
    const allInquiries = await Inquiry.find({}, 'status isRead').lean();
    const total = allInquiries.length;
    const unreadCount = allInquiries.filter((inq) => !inq.isRead).length;

    const countsByStatus = {
      new: 0,
      contacted: 0,
      'in-progress': 0,
      qualified: 0,
      converted: 0,
      closed: 0,
      spam: 0,
    };

    allInquiries.forEach((inq) => {
      if (countsByStatus[inq.status] !== undefined) {
        countsByStatus[inq.status] += 1;
      }
    });

    return res.status(200).json({
      success: true,
      total,
      unreadCount,
      filteredCount: filteredTotal,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      countsByStatus,
      data: inquiries,
    });
  } catch (err) {
    console.error('[Admin Inquiries List Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries list.',
    });
  }
};

/**
 * ADMIN: Get single inquiry by ID
 * GET /api/admin/inquiries/:id
 */
exports.getAdminInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry identifier format.',
      });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (err) {
    console.error('[Admin Inquiry Detail Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiry details.',
    });
  }
};

/**
 * ADMIN: Update inquiry status
 * PATCH /api/admin/inquiries/:id/status
 */
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry identifier format.',
      });
    }

    const validStatuses = Inquiry.VALID_STATUSES || [
      'new',
      'contacted',
      'in-progress',
      'qualified',
      'converted',
      'closed',
      'spam',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}.`,
      data: inquiry,
    });
  } catch (err) {
    console.error('[Admin Inquiry Status Update Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status.',
    });
  }
};

/**
 * ADMIN: Mark inquiry as read or unread
 * PATCH /api/admin/inquiries/:id/read
 */
exports.updateInquiryRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry identifier format.',
      });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    // If isRead is explicitly passed, use it; otherwise toggle
    const newReadState = typeof isRead === 'boolean' ? isRead : !inquiry.isRead;
    inquiry.isRead = newReadState;
    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: `Inquiry marked as ${newReadState ? 'read' : 'unread'}.`,
      data: inquiry,
    });
  } catch (err) {
    console.error('[Admin Inquiry Read Toggle Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry read status.',
    });
  }
};

/**
 * ADMIN: Update private notes on an inquiry
 * PATCH /api/admin/inquiries/:id/notes
 */
exports.updateInquiryNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry identifier format.',
      });
    }

    const sanitizedNotes = stripHtml(adminNotes || '');
    if (sanitizedNotes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Admin notes cannot exceed 5000 characters.',
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { adminNotes: sanitizedNotes },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin notes saved successfully.',
      data: inquiry,
    });
  } catch (err) {
    console.error('[Admin Inquiry Notes Update Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save admin notes.',
    });
  }
};

/**
 * ADMIN: Delete an inquiry permanently
 * DELETE /api/admin/inquiries/:id
 */
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inquiry identifier format.',
      });
    }

    const inquiry = await Inquiry.findByIdAndDelete(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.',
    });
  } catch (err) {
    console.error('[Admin Inquiry Delete Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry.',
    });
  }
};
