const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');
const { singleImageUpload } = require('../middleware/uploadMiddleware');

// Protect all /api/admin/media routes with JWT admin authentication
router.use(protect);

// Cloudinary configuration status
router.get('/status', mediaController.getCloudinaryStatus);

// Upload a single media file to Cloudinary and record in MongoDB
router.post('/upload', singleImageUpload, mediaController.uploadMedia);

// List all media with pagination, folder filtering, and search
router.get('/', mediaController.getAllMedia);

// Get single media asset with real-time usage check
router.get('/:id', mediaController.getMediaById);

// Update media metadata (altText, title, caption, folder)
router.put('/:id', mediaController.updateMediaMetadata);

// Safely delete media (blocked if currently referenced in CMS)
router.delete('/:id', mediaController.deleteMedia);

// Real-time usage check for a media asset
router.get('/:id/usage', mediaController.getMediaUsage);

module.exports = router;
