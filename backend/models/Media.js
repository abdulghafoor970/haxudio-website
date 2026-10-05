const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
      maxlength: [200, 'Filename cannot exceed 200 characters'],
    },
    originalFilename: {
      type: String,
      trim: true,
      default: '',
    },
    provider: {
      type: String,
      default: 'cloudinary',
      enum: ['cloudinary', 'local'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true,
    },
    secureUrl: {
      type: String,
      required: [true, 'Media secure URL is required'],
      trim: true,
    },
    resourceType: {
      type: String,
      default: 'image',
      trim: true,
    },
    format: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    mimeType: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    bytes: {
      type: Number,
      default: 0,
    },
    altText: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Alt text cannot exceed 300 characters'],
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    caption: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    folder: {
      type: String,
      trim: true,
      default: 'haxudio/misc',
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant querying and filtering
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ folder: 1, createdAt: -1 });
mediaSchema.index({ filename: 'text', title: 'text', altText: 'text' });

const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);

module.exports = Media;
