const mongoose = require('mongoose');
const Project = require('../models/Project');

// Helper to check valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * PUBLIC: Get all published projects
 * Supports ?category= and ?featured=true
 */
exports.getPublicProjects = async (req, res) => {
  try {
    const filter = { isPublished: true };

    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category.toLowerCase().trim();
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    const projects = await Project.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    console.error('[Public Projects Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve published projects',
    });
  }
};

/**
 * PUBLIC: Get single published project by slug
 */
exports.getPublicProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Project slug parameter is required',
      });
    }

    const project = await Project.findOne({
      slug: slug.toLowerCase().trim(),
      isPublished: true,
    }).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with slug '${slug}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error('[Public Project By Slug Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project details',
    });
  }
};

/**
 * ADMIN: Get all projects (published & drafts) + metrics
 */
exports.getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    const total = projects.length;
    const published = projects.filter((p) => p.isPublished).length;
    const drafts = total - published;
    const featured = projects.filter((p) => p.featured).length;

    return res.status(200).json({
      success: true,
      total,
      published,
      drafts,
      featured,
      data: projects,
    });
  } catch (err) {
    console.error('[Admin Projects Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects list',
    });
  }
};

/**
 * ADMIN: Get single project by ID
 */
exports.getAdminProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error('[Admin Get Project By ID Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
    });
  }
};

/**
 * ADMIN: Create new project
 */
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      category,
      client,
      clientType,
      industry,
      location,
      coverImage,
      coverImageAlt,
      images,
      technologies,
      services,
      deliverables,
      projectUrl,
      liveUrl,
      completionDate,
      year,
      challenge,
      solution,
      results,
      outcome,
      featured,
      isPublished,
      displayOrder,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    // Determine slug
    let targetSlug = (slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!targetSlug) {
      targetSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Check slug collision
    const existing = await Project.findOne({ slug: targetSlug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A project with slug '${targetSlug}' already exists. Please choose a different slug.`,
      });
    }

    const newProject = new Project({
      title: title.trim(),
      slug: targetSlug,
      shortDescription: shortDescription || '',
      description: description || '',
      category: (category || 'websites').toLowerCase().trim(),
      client: client || '',
      clientType: clientType || '',
      industry: industry || '',
      location: location || 'Quetta, Balochistan',
      coverImage: coverImage || req.body.image || '',
      coverImageAlt: coverImageAlt || '',
      images: Array.isArray(images) ? images : [],
      technologies: Array.isArray(technologies) ? technologies : [],
      services: Array.isArray(services) ? services : [],
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      projectUrl: projectUrl || '',
      liveUrl: liveUrl || '',
      completionDate: completionDate || '',
      year: year || new Date().getFullYear().toString(),
      challenge: challenge || '',
      solution: solution || '',
      results: results || outcome || '',
      outcome: outcome || results || '',
      featured: typeof featured === 'boolean' ? featured : false,
      isPublished: typeof isPublished === 'boolean' ? isPublished : true,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
    });

    await newProject.save();

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject,
    });
  } catch (err) {
    console.error('[Admin Create Project Error]:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to create project',
    });
  }
};

/**
 * ADMIN: Update existing project
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check slug change collision
    if (req.body.slug) {
      const targetSlug = req.body.slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (targetSlug !== project.slug) {
        const existing = await Project.findOne({ slug: targetSlug });
        if (existing && existing._id.toString() !== id) {
          return res.status(409).json({
            success: false,
            message: `A project with slug '${targetSlug}' already exists`,
          });
        }
        project.slug = targetSlug;
      }
    }

    // Update mutable fields
    const fields = [
      'title',
      'shortDescription',
      'description',
      'category',
      'client',
      'clientType',
      'industry',
      'location',
      'coverImage',
      'coverImageAlt',
      'images',
      'technologies',
      'services',
      'deliverables',
      'projectUrl',
      'liveUrl',
      'completionDate',
      'year',
      'challenge',
      'solution',
      'results',
      'outcome',
      'featured',
      'isPublished',
      'displayOrder',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    // Handle 'image' alias if sent
    if (req.body.image !== undefined && !req.body.coverImage) {
      project.coverImage = req.body.image;
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (err) {
    console.error('[Admin Update Project Error]:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to update project',
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
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project.isPublished = !project.isPublished;
    await project.save();

    return res.status(200).json({
      success: true,
      message: `Project ${project.isPublished ? 'published' : 'saved as draft'}`,
      isPublished: project.isPublished,
      data: project,
    });
  } catch (err) {
    console.error('[Admin Toggle Publish Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle publication status',
    });
  }
};

/**
 * ADMIN: Quick toggle featured
 */
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project.featured = !project.featured;
    await project.save();

    return res.status(200).json({
      success: true,
      message: `Project ${project.featured ? 'marked as featured' : 'unmarked from featured'}`,
      featured: project.featured,
      data: project,
    });
  } catch (err) {
    console.error('[Admin Toggle Featured Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
    });
  }
};

/**
 * ADMIN: Delete project
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Project '${project.title}' deleted successfully`,
    });
  } catch (err) {
    console.error('[Admin Delete Project Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};
