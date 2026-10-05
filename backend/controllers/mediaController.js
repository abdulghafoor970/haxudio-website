const path = require('path');
const Media = require('../models/Media');
const {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');
const { normalizeFolder, validateMediaUpdate } = require('../validators/mediaValidator');
const { findMediaUsage } = require('../services/mediaUsageService');

/**
 * Clean and sanitize a filename for display and storage
 */
function cleanFilename(originalName) {
  if (!originalName) return 'image-' + Date.now();
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const sanitized = base
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${sanitized || 'image'}-${Date.now()}${ext.toLowerCase()}`;
}

/**
 * ADMIN: Get Cloudinary configuration status
 * GET /api/admin/media/status
 */
exports.getCloudinaryStatus = async (req, res) => {
  const configured = isCloudinaryConfigured();
  return res.status(200).json({
    success: true,
    configured,
    cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME : null,
    maxFileSizeMB: 10,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  });
};

/**
 * ADMIN: Upload a new media image to Cloudinary and persist metadata in MongoDB
 * POST /api/admin/media/upload
 */
exports.uploadMedia = async (req, res, next) => {
  try {
    // 1. Verify Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        code: 'CLOUDINARY_NOT_CONFIGURED',
        message: 'Cloudinary storage credentials are not configured on the server. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
    }

    // 2. Verify file presence
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FILE',
        message: 'No image file was uploaded.',
      });
    }

    const originalName = req.file.originalname || 'upload.jpg';
    const folder = normalizeFolder(req.body.folder);
    const altText = typeof req.body.altText === 'string' ? req.body.altText.trim().slice(0, 300) : '';
    const title = typeof req.body.title === 'string' ? req.body.title.trim().slice(0, 150) : '';
    const caption = typeof req.body.caption === 'string' ? req.body.caption.trim().slice(0, 500) : '';

    const sanitizedBaseName = path.basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^\w-]/g, '_')
      .slice(0, 50);
    const publicId = `${sanitizedBaseName}_${Date.now()}`;

    // 3. Upload to Cloudinary
    const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      public_id: publicId,
      overwrite: true,
    });

    // 4. Create MongoDB Media record
    const mediaDoc = await Media.create({
      filename: cleanFilename(originalName),
      originalFilename: originalName,
      provider: 'cloudinary',
      publicId: cloudinaryResult.public_id,
      url: cloudinaryResult.url,
      secureUrl: cloudinaryResult.secure_url,
      resourceType: cloudinaryResult.resource_type || 'image',
      format: cloudinaryResult.format || path.extname(originalName).replace('.', ''),
      mimeType: req.file.mimetype,
      width: cloudinaryResult.width || 0,
      height: cloudinaryResult.height || 0,
      bytes: cloudinaryResult.bytes || req.file.size,
      altText,
      title: title || originalName,
      caption,
      folder,
      uploadedBy: req.admin?._id || req.user?.id || null,
      isActive: true,
    });

    // 5. Return sanitized record (no secrets)
    res.status(201).json({
      success: true,
      message: 'Image uploaded and processed successfully.',
      data: {
        id: mediaDoc._id,
        _id: mediaDoc._id,
        filename: mediaDoc.filename,
        originalFilename: mediaDoc.originalFilename,
        publicId: mediaDoc.publicId,
        url: mediaDoc.url,
        secureUrl: mediaDoc.secureUrl,
        format: mediaDoc.format,
        mimeType: mediaDoc.mimeType,
        width: mediaDoc.width,
        height: mediaDoc.height,
        bytes: mediaDoc.bytes,
        altText: mediaDoc.altText,
        title: mediaDoc.title,
        caption: mediaDoc.caption,
        folder: mediaDoc.folder,
        createdAt: mediaDoc.createdAt,
      },
    });
  } catch (err) {
    if (err.message === 'CLOUDINARY_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        code: 'CLOUDINARY_NOT_CONFIGURED',
        message: 'Cloudinary storage credentials are not configured on the server.',
      });
    }
    next(err);
  }
};

/**
 * ADMIN: Get all media records with pagination, search, and folder filtering
 * GET /api/admin/media
 */
exports.getAllMedia = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 18));
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Folder filtering
    if (req.query.folder && typeof req.query.folder === 'string' && req.query.folder !== 'all') {
      query.folder = normalizeFolder(req.query.folder);
    }

    // Search filtering (filename, title, altText)
    if (req.query.search && typeof req.query.search === 'string' && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { filename: searchRegex },
        { originalFilename: searchRegex },
        { title: searchRegex },
        { altText: searchRegex },
      ];
    }

    const [total, items] = await Promise.all([
      Media.countDocuments(query),
      Media.find(query)
        .populate('uploadedBy', 'name username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages,
      currentPage: page,
      limit,
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Get single media record and its real-time CMS usage
 * GET /api/admin/media/:id
 */
exports.getMediaById = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
      .populate('uploadedBy', 'name username email')
      .lean();

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.',
      });
    }

    const usage = await findMediaUsage(media);

    res.status(200).json({
      success: true,
      data: {
        ...media,
        usage,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Update media metadata (altText, title, caption)
 * PUT /api/admin/media/:id
 */
exports.updateMediaMetadata = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateMediaUpdate(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' '),
        errors,
      });
    }

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { $set: sanitized },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name username email');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Media metadata updated successfully.',
      data: media,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Safely delete media (blocks deletion if currently in use by any CMS document)
 * DELETE /api/admin/media/:id
 */
exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.',
      });
    }

    // 1. Strict Reference Check across all CMS collections
    const usage = await findMediaUsage(media);

    if (usage.inUse) {
      return res.status(409).json({
        success: false,
        code: 'MEDIA_IN_USE',
        message: `This media asset cannot be deleted because it is currently used by ${usage.usageCount} record(s).`,
        usageCount: usage.usageCount,
        references: usage.references,
      });
    }

    // 2. Delete from Cloudinary if provider is cloudinary
    if (media.provider === 'cloudinary' && media.publicId) {
      if (isCloudinaryConfigured()) {
        try {
          const cloudResult = await deleteFromCloudinary(media.publicId);
          // If Cloudinary explicitly returns an error status
          if (cloudResult && cloudResult.result !== 'ok' && cloudResult.result !== 'not found') {
            console.warn('[deleteMedia] Cloudinary destroy result was not ok:', cloudResult);
          }
        } catch (cloudErr) {
          console.error('[deleteMedia] Failed to delete from Cloudinary:', cloudErr.message);
          return res.status(502).json({
            success: false,
            code: 'CLOUDINARY_DELETE_FAILED',
            message: 'Failed to delete asset from Cloudinary storage. Media record preserved in database.',
          });
        }
      } else {
        console.warn('[deleteMedia] Cloudinary credentials not configured; deleting DB record only.');
      }
    }

    // 3. Delete from MongoDB
    await Media.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Media asset deleted successfully from storage and database.',
      deletedId: req.params.id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Check where a media item is being used
 * GET /api/admin/media/:id/usage
 */
exports.getMediaUsage = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id).lean();

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media asset not found.',
      });
    }

    const usage = await findMediaUsage(media);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (err) {
    next(err);
  }
};
