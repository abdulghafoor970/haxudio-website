const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * PUBLIC: Get all published testimonials
 * Only returns isPublished: true, sorted by displayOrder asc
 */
exports.getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean({ virtuals: true });

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (err) {
    console.error('[Public Testimonials Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve published testimonials',
    });
  }
};

/**
 * ADMIN: Get all testimonials + metrics (total, published, drafts)
 */
exports.getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean({ virtuals: true });

    const total = testimonials.length;
    const published = testimonials.filter((t) => t.isPublished).length;
    const drafts = total - published;

    return res.status(200).json({
      success: true,
      total,
      published,
      drafts,
      data: testimonials,
    });
  } catch (err) {
    console.error('[Admin Testimonials Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve testimonials list',
    });
  }
};

/**
 * ADMIN: Get single testimonial by ID
 */
exports.getAdminTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format',
      });
    }

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (err) {
    console.error('[Admin Get Testimonial Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve testimonial',
    });
  }
};

/**
 * ADMIN: Create new testimonial
 */
exports.createTestimonial = async (req, res) => {
  try {
    const {
      name,
      author,
      position,
      role,
      company,
      organization,
      testimonial,
      quote,
      photo,
      image,
      photoAlt,
      rating,
      project,
      verified,
      isPublished,
      displayOrder,
    } = req.body;

    const clientName = (name || author || '').trim();
    const quoteText = (testimonial || quote || '').trim();

    if (!clientName) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required',
      });
    }

    if (!quoteText) {
      return res.status(400).json({
        success: false,
        message: 'Testimonial quote text is required',
      });
    }

    const newTestimonial = new Testimonial({
      name: clientName,
      position: (position || role || '').trim(),
      company: (company || organization || '').trim(),
      testimonial: quoteText,
      photo: (photo || image || '').trim(),
      photoAlt: (photoAlt || '').trim(),
      rating: typeof rating === 'number' ? rating : 5,
      project: (project || '').trim(),
      verified: typeof verified === 'boolean' ? verified : true,
      isPublished: typeof isPublished === 'boolean' ? isPublished : true,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
    });

    await newTestimonial.save();

    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: newTestimonial,
    });
  } catch (err) {
    console.error('[Admin Create Testimonial Error]:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to create testimonial',
    });
  }
};

/**
 * ADMIN: Update existing testimonial
 */
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format',
      });
    }

    const item = await Testimonial.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    // Map fields
    if (req.body.name !== undefined) item.name = req.body.name.trim();
    if (req.body.author !== undefined && req.body.name === undefined) item.name = req.body.author.trim();

    if (req.body.position !== undefined) item.position = req.body.position.trim();
    if (req.body.role !== undefined && req.body.position === undefined) item.position = req.body.role.trim();

    if (req.body.company !== undefined) item.company = req.body.company.trim();
    if (req.body.organization !== undefined && req.body.company === undefined) item.company = req.body.organization.trim();

    if (req.body.testimonial !== undefined) item.testimonial = req.body.testimonial.trim();
    if (req.body.quote !== undefined && req.body.testimonial === undefined) item.testimonial = req.body.quote.trim();

    if (req.body.photo !== undefined) item.photo = req.body.photo.trim();
    if (req.body.image !== undefined && req.body.photo === undefined) item.photo = req.body.image.trim();

    if (req.body.photoAlt !== undefined) item.photoAlt = req.body.photoAlt.trim();
    if (req.body.project !== undefined) item.project = req.body.project.trim();
    if (typeof req.body.rating === 'number') item.rating = req.body.rating;
    if (typeof req.body.verified === 'boolean') item.verified = req.body.verified;
    if (typeof req.body.isPublished === 'boolean') item.isPublished = req.body.isPublished;
    if (typeof req.body.displayOrder === 'number') item.displayOrder = req.body.displayOrder;

    await item.save();

    return res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: item,
    });
  } catch (err) {
    console.error('[Admin Update Testimonial Error]:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update testimonial',
    });
  }
};

/**
 * ADMIN: Quick toggle publish
 */
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format',
      });
    }

    const item = await Testimonial.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    item.isPublished = !item.isPublished;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `Testimonial ${item.isPublished ? 'published' : 'saved as draft'}`,
      isPublished: item.isPublished,
      data: item,
    });
  } catch (err) {
    console.error('[Admin Toggle Publish Testimonial Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle publication status',
    });
  }
};

/**
 * ADMIN: Delete testimonial
 */
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format',
      });
    }

    const item = await Testimonial.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Testimonial from '${item.name}' deleted successfully`,
    });
  } catch (err) {
    console.error('[Admin Delete Testimonial Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
    });
  }
};
