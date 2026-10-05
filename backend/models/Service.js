const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (e.g. web-development)'],
    },
    eyebrow: {
      type: String,
      trim: true,
      default: 'Digital Capability',
      maxlength: [100, 'Eyebrow cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [300, 'Tagline cannot exceed 300 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    heroDescription: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      default: 'Sparkles',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    imageAlt: {
      type: String,
      trim: true,
      default: '',
    },
    problem: {
      type: String,
      trim: true,
    },
    solution: {
      type: String,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    deliverables: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    localFocus: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Get a Proposal',
    },
    ctaLink: {
      type: String,
      trim: true,
      default: '/contact',
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'SEO title cannot exceed 200 characters'],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [350, 'SEO description cannot exceed 350 characters'],
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    faqs: [
      {
        q: { type: String, trim: true },
        a: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before validation if not explicitly provided
serviceSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  // Sync features with deliverables if one is empty
  if (Array.isArray(this.features) && this.features.length > 0 && (!this.deliverables || this.deliverables.length === 0)) {
    this.deliverables = [...this.features];
  } else if (Array.isArray(this.deliverables) && this.deliverables.length > 0 && (!this.features || this.features.length === 0)) {
    this.features = [...this.deliverables];
  }
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

module.exports = Service;
