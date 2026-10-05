const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB maximum

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  // Explicitly reject SVG
  if (mime === 'image/svg+xml' || ext === '.svg') {
    const error = new Error('SVG uploads are not permitted for security reasons. Please use WebP, PNG, JPEG, or AVIF.');
    error.code = 'UNSUPPORTED_FILE_TYPE';
    error.status = 400;
    return cb(error, false);
  }

  // Check MIME and extension
  if (!ALLOWED_MIME_TYPES.includes(mime) || !ALLOWED_EXTENSIONS.includes(ext)) {
    const error = new Error(`Unsupported image format (${mime || ext}). Allowed formats: JPEG, PNG, WebP, AVIF.`);
    error.code = 'UNSUPPORTED_FILE_TYPE';
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Express wrapper middleware that catches Multer errors and returns consistent JSON errors
 */
const singleImageUpload = (req, res, next) => {
  const uploadHandler = upload.single('file');

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds the 10 MB limit (Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB).`,
          });
        }
        return res.status(400).json({
          success: false,
          code: 'UPLOAD_ERROR',
          message: err.message || 'Error occurred while processing file upload.',
        });
      }

      if (err.code === 'UNSUPPORTED_FILE_TYPE' || err.status === 400) {
        return res.status(400).json({
          success: false,
          code: 'UNSUPPORTED_FILE_TYPE',
          message: err.message,
        });
      }

      return res.status(500).json({
        success: false,
        code: 'UPLOAD_FAILED',
        message: err.message || 'Internal upload error.',
      });
    }

    next();
  });
};

module.exports = {
  singleImageUpload,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
};
