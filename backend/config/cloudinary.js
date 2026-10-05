const cloudinary = require('cloudinary').v2;

/**
 * Checks if Cloudinary credentials are fully configured in environment
 * @returns {boolean}
 */
function isCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName.trim() !== '' &&
    apiKey.trim() !== '' &&
    apiSecret.trim() !== '' &&
    !cloudName.includes('MY_') &&
    !apiKey.includes('MY_')
  );
}

// Configure Cloudinary SDK instance safely
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
}

/**
 * Upload an in-memory file buffer directly to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from Multer
 * @param {Object} options - Cloudinary upload options (folder, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('CLOUDINARY_NOT_CONFIGURED'));
    }

    const uploadOptions = {
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    stream.end(buffer);
  });
}

/**
 * Safely delete an asset from Cloudinary by its publicId
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Cloudinary destroy result
 */
async function deleteFromCloudinary(publicId) {
  if (!isCloudinaryConfigured()) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }
  return await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
