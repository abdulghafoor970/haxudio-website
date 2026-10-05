const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema(
  {
    business: {
      businessName: {
        type: String,
        trim: true,
        default: 'Haxudio Digital Solutions',
      },
      shortName: {
        type: String,
        trim: true,
        default: 'Haxudio',
      },
      tagline: {
        type: String,
        trim: true,
        default: 'Digital solutions built to move your business forward.',
      },
      description: {
        type: String,
        trim: true,
        default: 'A modern digital solutions agency based in Quetta, Balochistan. We engineer high-performance web systems, brand identities, SEO architecture, and growth strategies for ambitious businesses across Pakistan.',
      },
      foundedLocation: {
        type: String,
        trim: true,
        default: 'Quetta, Balochistan, Pakistan',
      },
      workingHours: {
        type: String,
        trim: true,
        default: 'Mon – Sat: 09:00 AM – 06:00 PM PKT',
      },
    },
    contact: {
      primaryEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'hello@haxudio.com',
      },
      secondaryEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'contact@haxudio.com',
      },
      phone: {
        type: String,
        trim: true,
        default: '+92 318 3690179',
      },
      whatsapp: {
        type: String,
        trim: true,
        default: '+92318 3690179',
      },
      whatsappUrl: {
        type: String,
        trim: true,
        default: 'https://wa.me/923183690179?text=Hello%20Haxudio%20Digital%20Solutions%2C%20I%20would%20like%20to%20inquire%20about%20a%20project.',
      },
      locationDisplay: {
        type: String,
        trim: true,
        default: 'Quetta, Balochistan, Pakistan',
      },
      address: {
        type: String,
        trim: true,
        default: 'A1 City, Hazara Town, Brewery Road, Quetta, Balochistan, Pakistan',
      },
      streetAddress: {
        type: String,
        trim: true,
        default: 'A1 City, Hazara Town, Brewery Road',
      },
      city: {
        type: String,
        trim: true,
        default: 'Quetta',
      },
      region: {
        type: String,
        trim: true,
        default: 'Balochistan',
      },
      country: {
        type: String,
        trim: true,
        default: 'Pakistan',
      },
      mapUrl: {
        type: String,
        trim: true,
        default: 'https://share.google/zFaaZlrDoY9v7zIEZ',
      },
    },
    social: {
      instagram: {
        type: String,
        trim: true,
        default: 'https://www.instagram.com/haxudio/',
      },
      facebook: {
        type: String,
        trim: true,
        default: 'https://www.facebook.com/haxudio/',
      },
      linkedin: {
        type: String,
        trim: true,
        default: 'https://www.linkedin.com/company/haxudio/',
      },
      x: {
        type: String,
        trim: true,
        default: 'https://x.com/haxudio',
      },
      youtube: {
        type: String,
        trim: true,
        default: '',
      },
      github: {
        type: String,
        trim: true,
        default: '',
      },
      googleBusinessProfile: {
        type: String,
        trim: true,
        default: 'https://share.google/zFaaZlrDoY9v7zIEZ',
      },
    },
    branding: {
      logo: {
        type: String,
        trim: true,
        default: '',
      },
      logoAlt: {
        type: String,
        trim: true,
        default: 'Haxudio Digital Solutions',
      },
      favicon: {
        type: String,
        trim: true,
        default: '',
      },
      defaultOgImage: {
        type: String,
        trim: true,
        default: 'https://www.haxudio.com/og-image.jpg',
      },
    },
    globalCta: {
      ctaLabel: {
        type: String,
        trim: true,
        default: 'Get a Proposal',
      },
      ctaUrl: {
        type: String,
        trim: true,
        default: '/contact',
      },
    },
    seoDefaults: {
      defaultTitle: {
        type: String,
        trim: true,
        default: 'Haxudio Digital Solutions | Digital Agency in Quetta, Pakistan',
      },
      titleSuffix: {
        type: String,
        trim: true,
        default: ' | Haxudio Digital Solutions',
      },
      defaultDescription: {
        type: String,
        trim: true,
        default: 'Haxudio Digital Solutions is a Quetta-based digital agency offering web development, SEO, digital marketing, branding, graphic design, and modern digital solutions across Pakistan.',
      },
      defaultKeywords: [
        {
          type: String,
          trim: true,
        },
      ],
      defaultOgImage: {
        type: String,
        trim: true,
        default: 'https://www.haxudio.com/og-image.jpg',
      },
      canonicalBase: {
        type: String,
        trim: true,
        default: 'https://www.haxudio.com/',
      },
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

const GlobalSettings = mongoose.models.GlobalSettings || mongoose.model('GlobalSettings', globalSettingsSchema);

module.exports = GlobalSettings;
