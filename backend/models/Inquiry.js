const mongoose = require('mongoose');

const VALID_STATUSES = [
  'new',
  'contacted',
  'in-progress',
  'qualified',
  'converted',
  'closed',
  'spam',
];

const InquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Email cannot exceed 120 characters'],
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Phone cannot exceed 50 characters'],
    },
    company: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Company cannot exceed 150 characters'],
    },
    service: {
      type: String,
      trim: true,
      default: 'general',
      maxlength: [100, 'Service cannot exceed 100 characters'],
    },
    budget: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Budget cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Project message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    source: {
      type: String,
      trim: true,
      default: 'contact-page',
      maxlength: [100, 'Source cannot exceed 100 characters'],
    },
    pageUrl: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Page URL cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: 'Invalid inquiry status: {VALUE}',
      },
      default: 'new',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Admin notes cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance & filtering
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, isRead: 1 });
InquirySchema.index({ email: 1 });

module.exports = mongoose.model('Inquiry', InquirySchema);
module.exports.VALID_STATUSES = VALID_STATUSES;
