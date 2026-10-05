const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
      default: '',
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
      default: '',
    },
    testimonial: {
      type: String,
      required: [true, 'Testimonial quote text is required'],
      trim: true,
      maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
    },
    photo: {
      type: String,
      trim: true,
      default: '',
    },
    photoAlt: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    project: {
      type: String,
      trim: true,
      default: '',
    },
    verified: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for seamless frontend compatibility
TestimonialSchema.virtual('author').get(function () {
  return this.name;
});

TestimonialSchema.virtual('quote').get(function () {
  return this.testimonial;
});

TestimonialSchema.virtual('role').get(function () {
  return this.position;
});

TestimonialSchema.virtual('organization').get(function () {
  return this.company;
});

TestimonialSchema.virtual('image').get(function () {
  return this.photo;
});

// Pre-validate hook
TestimonialSchema.pre('validate', function () {
  if (!this.photoAlt && this.name) {
    this.photoAlt = `${this.name} testimonial photo`;
  }
});

const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);

module.exports = Testimonial;
