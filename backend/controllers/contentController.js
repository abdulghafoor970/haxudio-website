const WebsiteContent = require('../models/WebsiteContent');
const { validateContentPayload, ALLOWED_PAGES } = require('../validators/contentValidator');

/**
 * PUBLIC: Get all active sections for a specific page (e.g. /api/content/home)
 */
exports.getPublicPageContent = async (req, res, next) => {
  try {
    const rawPage = req.params.page ? req.params.page.toLowerCase().trim() : '';

    if (!ALLOWED_PAGES.includes(rawPage)) {
      return res.status(404).json({
        success: false,
        message: `Content for page '${rawPage}' not found. Supported pages: ${ALLOWED_PAGES.join(', ')}.`,
      });
    }

    const sections = await WebsiteContent.find({
      page: rawPage,
      isActive: true,
    }).select('-updatedBy -__v').lean();

    // Key-value dictionary by section name for convenient consumption
    const sectionMap = {};
    for (const item of sections) {
      sectionMap[item.section] = {
        title: item.title,
        content: item.content,
        updatedAt: item.updatedAt,
      };
    }

    res.status(200).json({
      success: true,
      page: rawPage,
      count: sections.length,
      sections: sectionMap,
      data: sections,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Get all website content items across all pages
 */
exports.getAdminAllContent = async (req, res, next) => {
  try {
    const pageFilter = req.query.page ? req.query.page.toLowerCase().trim() : null;
    const query = {};
    if (pageFilter && ALLOWED_PAGES.includes(pageFilter)) {
      query.page = pageFilter;
    }

    const items = await WebsiteContent.find(query)
      .populate('updatedBy', 'name email')
      .sort({ page: 1, section: 1 })
      .lean();

    // Group items by page
    const grouped = {
      home: [],
      about: [],
      contact: [],
    };

    for (const item of items) {
      if (grouped[item.page]) {
        grouped[item.page].push(item);
      }
    }

    res.status(200).json({
      success: true,
      total: items.length,
      grouped,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Get all sections for a specific page (including inactive)
 */
exports.getAdminPageContent = async (req, res, next) => {
  try {
    const rawPage = req.params.page ? req.params.page.toLowerCase().trim() : '';

    if (!ALLOWED_PAGES.includes(rawPage)) {
      return res.status(404).json({
        success: false,
        message: `Page '${rawPage}' not found. Supported pages: ${ALLOWED_PAGES.join(', ')}.`,
      });
    }

    const sections = await WebsiteContent.find({ page: rawPage })
      .populate('updatedBy', 'name email')
      .sort({ section: 1 })
      .lean();

    const sectionMap = {};
    for (const item of sections) {
      sectionMap[item.section] = item;
    }

    res.status(200).json({
      success: true,
      page: rawPage,
      count: sections.length,
      sections: sectionMap,
      data: sections,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Create or update section content (PUT /api/admin/content/:page/:section)
 */
exports.updateSectionContent = async (req, res, next) => {
  try {
    const page = req.params.page ? req.params.page.toLowerCase().trim() : '';
    const section = req.params.section ? req.params.section.toLowerCase().trim() : '';

    const { isValid, errors, sanitized } = validateContentPayload(page, section, req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' '),
        errors,
      });
    }

    const updateDoc = {
      page: sanitized.page,
      section: sanitized.section,
      title: sanitized.title,
      content: sanitized.content,
      isActive: sanitized.isActive,
      updatedBy: req.admin?._id || req.user?.id || null,
    };

    const updated = await WebsiteContent.findOneAndUpdate(
      { page: sanitized.page, section: sanitized.section },
      { $set: updateDoc },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Section '${sanitized.section}' on page '${sanitized.page}' updated successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Delete a section
 */
exports.deleteSectionContent = async (req, res, next) => {
  try {
    const page = req.params.page ? req.params.page.toLowerCase().trim() : '';
    const section = req.params.section ? req.params.section.toLowerCase().trim() : '';

    const deleted = await WebsiteContent.findOneAndDelete({ page, section });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Section '${section}' on page '${page}' does not exist.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Section '${section}' on page '${page}' removed.`,
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};
