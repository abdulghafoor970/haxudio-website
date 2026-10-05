/**
 * Validation and sanitization for GlobalSettings submissions
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function cleanString(val, maxLength = 300) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

function cleanUrl(val) {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function validateAndSanitizeSettings(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: ['Invalid settings payload format.'],
      sanitized: null,
    };
  }

  const rawBusiness = body.business || {};
  const rawContact = body.contact || {};
  const rawSocial = body.social || {};
  const rawBranding = body.branding || {};
  const rawCta = body.globalCta || body.cta || {};
  const rawSeo = body.seoDefaults || body.seo || {};

  const business = {
    businessName: cleanString(rawBusiness.businessName || 'Haxudio Digital Solutions', 120),
    shortName: cleanString(rawBusiness.shortName || 'Haxudio', 50),
    tagline: cleanString(rawBusiness.tagline || '', 200),
    description: cleanString(rawBusiness.description || '', 500),
    foundedLocation: cleanString(rawBusiness.foundedLocation || 'Quetta, Balochistan, Pakistan', 100),
    workingHours: cleanString(rawBusiness.workingHours || 'Mon – Sat: 09:00 AM – 06:00 PM PKT', 100),
  };

  const primaryEmail = cleanString(rawContact.primaryEmail || 'hello@haxudio.com', 120).toLowerCase();
  const secondaryEmail = cleanString(rawContact.secondaryEmail || '', 120).toLowerCase();

  if (primaryEmail && !EMAIL_REGEX.test(primaryEmail)) {
    errors.push('Primary contact email is not valid.');
  }
  if (secondaryEmail && !EMAIL_REGEX.test(secondaryEmail)) {
    errors.push('Secondary contact email is not valid.');
  }

  const contact = {
    primaryEmail: primaryEmail || 'hello@haxudio.com',
    secondaryEmail,
    phone: cleanString(rawContact.phone || '+92 318 3690179', 50),
    whatsapp: cleanString(rawContact.whatsapp || '+92318 3690179', 50),
    whatsappUrl: cleanUrl(rawContact.whatsappUrl || 'https://wa.me/923183690179?text=Hello%20Haxudio%20Digital%20Solutions%2C%20I%20would%20like%20to%20inquire%20about%20a%20project.'),
    locationDisplay: cleanString(rawContact.locationDisplay || 'Quetta, Balochistan, Pakistan', 100),
    address: cleanString(rawContact.address || 'A1 City, Hazara Town, Brewery Road, Quetta, Balochistan, Pakistan', 250),
    streetAddress: cleanString(rawContact.streetAddress || 'A1 City, Hazara Town, Brewery Road', 150),
    city: cleanString(rawContact.city || 'Quetta', 80),
    region: cleanString(rawContact.region || 'Balochistan', 80),
    country: cleanString(rawContact.country || 'Pakistan', 80),
    mapUrl: cleanUrl(rawContact.mapUrl || 'https://share.google/zFaaZlrDoY9v7zIEZ'),
  };

  const social = {
    instagram: cleanUrl(rawSocial.instagram || 'https://www.instagram.com/haxudio/'),
    facebook: cleanUrl(rawSocial.facebook || 'https://www.facebook.com/haxudio/'),
    linkedin: cleanUrl(rawSocial.linkedin || 'https://www.linkedin.com/company/haxudio/'),
    x: cleanUrl(rawSocial.x || 'https://x.com/haxudio'),
    youtube: cleanUrl(rawSocial.youtube || ''),
    github: cleanUrl(rawSocial.github || ''),
    googleBusinessProfile: cleanUrl(rawSocial.googleBusinessProfile || 'https://share.google/zFaaZlrDoY9v7zIEZ'),
  };

  const branding = {
    logo: cleanString(rawBranding.logo || '', 300),
    logoAlt: cleanString(rawBranding.logoAlt || 'Haxudio Digital Solutions', 120),
    favicon: cleanString(rawBranding.favicon || '', 300),
    defaultOgImage: cleanString(rawBranding.defaultOgImage || 'https://www.haxudio.com/og-image.jpg', 300),
  };

  const globalCta = {
    ctaLabel: cleanString(rawCta.ctaLabel || 'Get a Proposal', 60),
    ctaUrl: cleanString(rawCta.ctaUrl || '/contact', 100),
  };

  let rawKeywords = rawSeo.defaultKeywords;
  let defaultKeywords = [];
  if (Array.isArray(rawKeywords)) {
    defaultKeywords = rawKeywords.map((k) => cleanString(k, 50)).filter(Boolean).slice(0, 20);
  } else if (typeof rawKeywords === 'string') {
    defaultKeywords = rawKeywords.split(',').map((k) => cleanString(k, 50)).filter(Boolean).slice(0, 20);
  }

  const seoDefaults = {
    defaultTitle: cleanString(rawSeo.defaultTitle || 'Haxudio Digital Solutions | Digital Agency in Quetta, Pakistan', 150),
    titleSuffix: cleanString(rawSeo.titleSuffix || ' | Haxudio Digital Solutions', 80),
    defaultDescription: cleanString(rawSeo.defaultDescription || '', 400),
    defaultKeywords,
    defaultOgImage: cleanString(rawSeo.defaultOgImage || 'https://www.haxudio.com/og-image.jpg', 300),
    canonicalBase: cleanString(rawSeo.canonicalBase || 'https://www.haxudio.com/', 150),
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      business,
      contact,
      social,
      branding,
      globalCta,
      seoDefaults,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
    },
  };
}

module.exports = {
  validateAndSanitizeSettings,
};
