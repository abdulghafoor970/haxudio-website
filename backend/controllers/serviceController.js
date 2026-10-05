const mongoose = require('mongoose');
const Service = require('../models/Service');

// Helper to check valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// PUBLIC: Get all published services
exports.getPublicServices = async (req, res) => {
  try {
    const services = await Service.find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    console.error('[Public Services Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve published services',
    });
  }
};

// PUBLIC: Get single published service by slug
exports.getPublicServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Service slug parameter is required',
      });
    }

    const service = await Service.findOne({
      slug: slug.toLowerCase().trim(),
      isPublished: true,
    }).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with slug '${slug}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    console.error('[Public Service By Slug Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve service details',
    });
  }
};

// ADMIN: Get all services (published and drafts) with metadata
exports.getAdminServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    const publishedCount = services.filter((s) => s.isPublished).length;
    const draftCount = services.length - publishedCount;

    return res.status(200).json({
      success: true,
      total: services.length,
      published: publishedCount,
      drafts: draftCount,
      data: services,
    });
  } catch (err) {
    console.error('[Admin Get Services Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve services for administration',
    });
  }
};

// ADMIN: Get single service by ID
exports.getAdminServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const service = await Service.findById(id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    console.error('[Admin Get Service By ID Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve service',
    });
  }
};

// ADMIN: Create a new service
exports.createService = async (req, res) => {
  try {
    const {
      title,
      slug,
      eyebrow,
      tagline,
      shortDescription,
      description,
      heroDescription,
      icon,
      image,
      imageAlt,
      problem,
      solution,
      features,
      deliverables,
      benefits,
      techStack,
      localFocus,
      ctaText,
      ctaLink,
      isPublished,
      displayOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Service title is required',
      });
    }

    // Determine target slug
    let targetSlug = slug
      ? slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    // Ensure slug uniqueness
    const slugExists = await Service.findOne({ slug: targetSlug });
    if (slugExists) {
      return res.status(409).json({
        success: false,
        message: `A service with slug '${targetSlug}' already exists. Please provide a unique slug or title.`,
      });
    }

    const newService = await Service.create({
      title: title.trim(),
      slug: targetSlug,
      eyebrow: eyebrow ? eyebrow.trim() : 'Digital Capability',
      tagline: tagline ? tagline.trim() : '',
      shortDescription: shortDescription ? shortDescription.trim() : '',
      description: description ? description.trim() : (shortDescription || ''),
      heroDescription: heroDescription ? heroDescription.trim() : (description || shortDescription || ''),
      icon: icon ? icon.trim() : 'Sparkles',
      image: image ? image.trim() : '',
      imageAlt: imageAlt ? imageAlt.trim() : (title.trim() + ' Digital Solutions Quetta'),
      problem: problem ? problem.trim() : '',
      solution: solution ? solution.trim() : '',
      features: Array.isArray(features) ? features.filter(Boolean) : [],
      deliverables: Array.isArray(deliverables) ? deliverables.filter(Boolean) : (Array.isArray(features) ? features.filter(Boolean) : []),
      benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
      techStack: Array.isArray(techStack) ? techStack.filter(Boolean) : [],
      localFocus: localFocus ? localFocus.trim() : 'Quetta & Pakistan',
      ctaText: ctaText ? ctaText.trim() : 'Get a Proposal',
      ctaLink: ctaLink ? ctaLink.trim() : '/contact',
      isPublished: typeof isPublished === 'boolean' ? isPublished : true,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      seoTitle: seoTitle ? seoTitle.trim() : `${title.trim()} | Haxudio Digital Solutions`,
      seoDescription: seoDescription ? seoDescription.trim() : (shortDescription ? shortDescription.trim() : ''),
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords.filter(Boolean) : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService,
    });
  } catch (err) {
    console.error('[Admin Create Service Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create service',
    });
  }
};

// ADMIN: Update existing service by ID
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const {
      title,
      slug,
      eyebrow,
      tagline,
      shortDescription,
      description,
      heroDescription,
      icon,
      image,
      imageAlt,
      problem,
      solution,
      features,
      deliverables,
      benefits,
      techStack,
      localFocus,
      ctaText,
      ctaLink,
      isPublished,
      displayOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      service.title = title.trim();
    }

    if (slug !== undefined) {
      const normalizedSlug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      if (normalizedSlug !== service.slug) {
        const slugExists = await Service.findOne({ slug: normalizedSlug, _id: { $ne: service._id } });
        if (slugExists) {
          return res.status(409).json({
            success: false,
            message: `A service with slug '${normalizedSlug}' already exists`,
          });
        }
        service.slug = normalizedSlug;
      }
    }

    if (eyebrow !== undefined) service.eyebrow = eyebrow.trim();
    if (tagline !== undefined) service.tagline = tagline.trim();
    if (shortDescription !== undefined) service.shortDescription = shortDescription.trim();
    if (description !== undefined) service.description = description.trim();
    if (heroDescription !== undefined) service.heroDescription = heroDescription.trim();
    if (icon !== undefined) service.icon = icon.trim();
    if (image !== undefined) service.image = image.trim();
    if (imageAlt !== undefined) service.imageAlt = imageAlt.trim();
    if (problem !== undefined) service.problem = problem.trim();
    if (solution !== undefined) service.solution = solution.trim();
    if (features !== undefined) service.features = Array.isArray(features) ? features.filter(Boolean) : [];
    if (deliverables !== undefined) service.deliverables = Array.isArray(deliverables) ? deliverables.filter(Boolean) : [];
    if (benefits !== undefined) service.benefits = Array.isArray(benefits) ? benefits.filter(Boolean) : [];
    if (techStack !== undefined) service.techStack = Array.isArray(techStack) ? techStack.filter(Boolean) : [];
    if (localFocus !== undefined) service.localFocus = localFocus.trim();
    if (ctaText !== undefined) service.ctaText = ctaText.trim();
    if (ctaLink !== undefined) service.ctaLink = ctaLink.trim();
    if (isPublished !== undefined) service.isPublished = Boolean(isPublished);
    if (displayOrder !== undefined) service.displayOrder = Number(displayOrder);
    if (seoTitle !== undefined) service.seoTitle = seoTitle.trim();
    if (seoDescription !== undefined) service.seoDescription = seoDescription.trim();
    if (seoKeywords !== undefined) service.seoKeywords = Array.isArray(seoKeywords) ? seoKeywords.filter(Boolean) : [];

    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    });
  } catch (err) {
    console.error('[Admin Update Service Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update service',
    });
  }
};

// ADMIN: Quick toggle publish status
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    service.isPublished = !service.isPublished;
    await service.save();

    return res.status(200).json({
      success: true,
      message: `Service status changed to ${service.isPublished ? 'Published' : 'Draft'}`,
      isPublished: service.isPublished,
      data: service,
    });
  } catch (err) {
    console.error('[Admin Toggle Publish Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle publish status',
    });
  }
};

// ADMIN: Delete a service by ID
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Service '${service.title}' deleted successfully`,
    });
  } catch (err) {
    console.error('[Admin Delete Service Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete service',
    });
  }
};
