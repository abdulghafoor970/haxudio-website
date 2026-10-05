const mongoose = require('mongoose');

/**
 * Helper to slugify a project title safely
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be alphanumeric words separated by single hyphens'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'websites',
      index: true,
    },
    client: {
      type: String,
      trim: true,
      maxlength: [120, 'Client name cannot exceed 120 characters'],
      default: '',
    },
    clientType: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [120, 'Industry cannot exceed 120 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Quetta, Balochistan',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    coverImageAlt: {
      type: String,
      trim: true,
      default: '',
    },
    // Supporting additional gallery images
    images: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
    },
    services: {
      type: [String],
      default: [],
    },
    deliverables: {
      type: [String],
      default: [],
    },
    projectUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
    },
    completionDate: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: String,
      trim: true,
      default: () => new Date().getFullYear().toString(),
    },
    challenge: {
      type: String,
      trim: true,
      default: '',
    },
    solution: {
      type: String,
      trim: true,
      default: '',
    },
    results: {
      type: String,
      trim: true,
      default: '',
    },
    outcome: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
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
    // SEO fields
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'SEO title cannot exceed 100 characters'],
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'SEO description cannot exceed 200 characters'],
      default: '',
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: 'image' resolves to coverImage
ProjectSchema.virtual('image').get(function () {
  return this.coverImage || '';
});

// Virtual alias: 'summary' resolves to shortDescription
ProjectSchema.virtual('summary').get(function () {
  return this.shortDescription || '';
});

// Pre-save hook to normalize slug and ensure fallbacks
ProjectSchema.pre('validate', function () {
  if (this.title && (!this.slug || this.slug.trim() === '')) {
    this.slug = slugify(this.title);
  } else if (this.slug) {
    this.slug = slugify(this.slug);
  }

  // Sync results and outcome if only one is provided
  if (this.results && !this.outcome) {
    this.outcome = this.results;
  } else if (this.outcome && !this.results) {
    this.results = this.outcome;
  }

  // Sync coverImage and image if provided
  if (!this.coverImageAlt && this.title) {
    this.coverImageAlt = `${this.title} Case Study Preview`;
  }
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

module.exports = Project;
