const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: [true, 'Page identifier is required'],
      trim: true,
      lowercase: true,
      enum: ['home', 'about', 'contact'],
      index: true,
    },
    section: {
      type: String,
      required: [true, 'Section identifier is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Section content is required'],
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index on page + section
websiteContentSchema.index({ page: 1, section: 1 }, { unique: true });

const WebsiteContent = mongoose.models.WebsiteContent || mongoose.model('WebsiteContent', websiteContentSchema);

module.exports = WebsiteContent;
