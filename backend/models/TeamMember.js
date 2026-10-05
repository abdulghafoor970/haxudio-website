const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Team member position/role is required'],
      trim: true,
      maxlength: [120, 'Position cannot exceed 120 characters'],
    },
    discipline: {
      type: String,
      trim: true,
      maxlength: [120, 'Discipline cannot exceed 120 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
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
    badge: {
      type: String,
      trim: true,
      maxlength: [60, 'Badge cannot exceed 60 characters'],
      default: '',
    },
    highlight: {
      type: String,
      trim: true,
      maxlength: [150, 'Highlight cannot exceed 150 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Quetta, Balochistan',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    x: {
      type: String,
      trim: true,
      default: '',
    },
    instagram: {
      type: String,
      trim: true,
      default: '',
    },
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
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

// Virtual aliases for seamless compatibility with frontend CoFoundersSlider
TeamMemberSchema.virtual('role').get(function () {
  return this.position;
});

TeamMemberSchema.virtual('image').get(function () {
  return this.photo;
});

TeamMemberSchema.virtual('socials').get(function () {
  return {
    linkedin: this.linkedin || '',
    x: this.x || '',
    instagram: this.instagram || '',
    facebook: this.facebook || '',
    github: this.github || '',
    portfolioUrl: this.portfolioUrl || '',
  };
});

// Pre-validate hook
TeamMemberSchema.pre('validate', function () {
  if (!this.photoAlt && this.name) {
    this.photoAlt = `${this.name} - ${this.position}`;
  }
});

const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);

module.exports = TeamMember;
