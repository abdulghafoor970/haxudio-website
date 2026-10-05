const GlobalSettings = require('../models/GlobalSettings');
const { validateAndSanitizeSettings } = require('../validators/settingsValidator');

// Fallback verified business defaults if DB document has not been created yet
const DEFAULT_BUSINESS_SETTINGS = {
  business: {
    businessName: 'Haxudio Digital Solutions',
    shortName: 'Haxudio',
    tagline: 'Digital solutions built to move your business forward.',
    description: 'A modern digital solutions agency based in Quetta, Balochistan. We engineer high-performance web systems, brand identities, SEO architecture, and growth strategies for ambitious businesses across Pakistan.',
    foundedLocation: 'Quetta, Balochistan, Pakistan',
    workingHours: 'Mon – Sat: 09:00 AM – 06:00 PM PKT',
  },
  contact: {
    primaryEmail: 'hello@haxudio.com',
    secondaryEmail: 'contact@haxudio.com',
    phone: '+92 318 3690179',
    whatsapp: '+92318 3690179',
    whatsappUrl: 'https://wa.me/923183690179?text=Hello%20Haxudio%20Digital%20Solutions%2C%20I%20would%20like%20to%20inquire%20about%20a%20project.',
    locationDisplay: 'Quetta, Balochistan, Pakistan',
    address: 'A1 City, Hazara Town, Brewery Road, Quetta, Balochistan, Pakistan',
    streetAddress: 'A1 City, Hazara Town, Brewery Road',
    city: 'Quetta',
    region: 'Balochistan',
    country: 'Pakistan',
    mapUrl: 'https://share.google/zFaaZlrDoY9v7zIEZ',
  },
  social: {
    instagram: 'https://www.instagram.com/haxudio/',
    facebook: 'https://www.facebook.com/haxudio/',
    linkedin: 'https://www.linkedin.com/company/haxudio/',
    x: 'https://x.com/haxudio',
    youtube: '',
    github: '',
    googleBusinessProfile: 'https://share.google/zFaaZlrDoY9v7zIEZ',
  },
  branding: {
    logo: '',
    logoAlt: 'Haxudio Digital Solutions',
    favicon: '',
    defaultOgImage: 'https://www.haxudio.com/og-image.jpg',
  },
  globalCta: {
    ctaLabel: 'Get a Proposal',
    ctaUrl: '/contact',
  },
  seoDefaults: {
    defaultTitle: 'Haxudio Digital Solutions | Digital Agency in Quetta, Pakistan',
    titleSuffix: ' | Haxudio Digital Solutions',
    defaultDescription: 'Haxudio Digital Solutions is a Quetta-based digital agency offering web development, SEO, digital marketing, branding, graphic design, and modern digital solutions across Pakistan.',
    defaultKeywords: ['Digital agency Quetta', 'Web development Pakistan', 'SEO Balochistan'],
    defaultOgImage: 'https://www.haxudio.com/og-image.jpg',
    canonicalBase: 'https://www.haxudio.com/',
  },
};

/**
 * PUBLIC: Safe read-only settings for public website display
 * GET /api/settings/public
 * NEVER exposes admin info, credentials, secrets, or internal flags
 */
exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await GlobalSettings.findOne({ isActive: true })
      .select('business contact social branding globalCta seoDefaults updatedAt')
      .lean();

    if (!settings) {
      settings = DEFAULT_BUSINESS_SETTINGS;
    }

    res.status(200).json({
      success: true,
      data: {
        business: settings.business || DEFAULT_BUSINESS_SETTINGS.business,
        contact: settings.contact || DEFAULT_BUSINESS_SETTINGS.contact,
        social: settings.social || DEFAULT_BUSINESS_SETTINGS.social,
        branding: settings.branding || DEFAULT_BUSINESS_SETTINGS.branding,
        globalCta: settings.globalCta || DEFAULT_BUSINESS_SETTINGS.globalCta,
        seoDefaults: settings.seoDefaults || DEFAULT_BUSINESS_SETTINGS.seoDefaults,
        updatedAt: settings.updatedAt || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Get full settings document
 * GET /api/admin/settings
 */
exports.getAdminSettings = async (req, res, next) => {
  try {
    let settings = await GlobalSettings.findOne()
      .populate('updatedBy', 'name email')
      .lean();

    if (!settings) {
      // Auto-initialize with default structure if empty
      const created = await GlobalSettings.create({
        ...DEFAULT_BUSINESS_SETTINGS,
        updatedBy: req.admin?._id || req.user?.id || null,
      });
      settings = created.toObject();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: Update settings document
 * PUT /api/admin/settings
 */
exports.updateAdminSettings = async (req, res, next) => {
  try {
    const { isValid, errors, sanitized } = validateAndSanitizeSettings(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(' '),
        errors,
      });
    }

    const updateDoc = {
      business: sanitized.business,
      contact: sanitized.contact,
      social: sanitized.social,
      branding: sanitized.branding,
      globalCta: sanitized.globalCta,
      seoDefaults: sanitized.seoDefaults,
      isActive: sanitized.isActive,
      updatedBy: req.admin?._id || req.user?.id || null,
    };

    // Keep exactly one settings document active
    const settings = await GlobalSettings.findOneAndUpdate(
      {},
      { $set: updateDoc },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Global website settings updated successfully.',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};
