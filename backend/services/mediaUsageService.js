const Service = require('../models/Service');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const TeamMember = require('../models/TeamMember');
const WebsiteContent = require('../models/WebsiteContent');
const GlobalSettings = require('../models/GlobalSettings');

/**
 * Checks all CMS collections for references to a given media item
 * @param {Object} mediaDoc - The Media document or { url, secureUrl, publicId }
 * @returns {Promise<{ inUse: boolean, usageCount: number, references: Array<{ type: string, title: string, field: string, id: string }> }>}
 */
async function findMediaUsage(mediaDoc) {
  if (!mediaDoc) {
    return { inUse: false, usageCount: 0, references: [] };
  }

  const urlsToCheck = [
    mediaDoc.url,
    mediaDoc.secureUrl,
    mediaDoc.publicId,
  ].filter(Boolean);

  const references = [];

  // 1. Check Services
  try {
    const services = await Service.find({
      image: { $in: urlsToCheck },
    }).select('title slug image').lean();

    for (const s of services) {
      references.push({
        type: 'Service',
        title: s.title,
        field: 'Cover Image',
        id: s._id.toString(),
        slug: s.slug,
      });
    }
  } catch (err) {
    console.warn('[findMediaUsage] Error checking Services:', err.message);
  }

  // 2. Check Projects (coverImage or images gallery)
  try {
    const projects = await Project.find({
      $or: [
        { coverImage: { $in: urlsToCheck } },
        { images: { $in: urlsToCheck } },
      ],
    }).select('title slug coverImage images').lean();

    for (const p of projects) {
      if (urlsToCheck.includes(p.coverImage)) {
        references.push({
          type: 'Project',
          title: p.title,
          field: 'Cover Image',
          id: p._id.toString(),
          slug: p.slug,
        });
      }
      if (Array.isArray(p.images)) {
        const matchesGallery = p.images.some((img) => urlsToCheck.includes(img));
        if (matchesGallery) {
          references.push({
            type: 'Project',
            title: p.title,
            field: 'Gallery Image',
            id: p._id.toString(),
            slug: p.slug,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[findMediaUsage] Error checking Projects:', err.message);
  }

  // 3. Check Testimonials
  try {
    const testimonials = await Testimonial.find({
      photo: { $in: urlsToCheck },
    }).select('name company photo').lean();

    for (const t of testimonials) {
      references.push({
        type: 'Testimonial',
        title: t.name ? `${t.name}${t.company ? ` (${t.company})` : ''}` : 'Testimonial',
        field: 'Client Photo',
        id: t._id.toString(),
      });
    }
  } catch (err) {
    console.warn('[findMediaUsage] Error checking Testimonials:', err.message);
  }

  // 4. Check Team Members
  try {
    const teamMembers = await TeamMember.find({
      photo: { $in: urlsToCheck },
    }).select('name position photo').lean();

    for (const tm of teamMembers) {
      references.push({
        type: 'Team Member',
        title: `${tm.name} (${tm.position})`,
        field: 'Member Photo',
        id: tm._id.toString(),
      });
    }
  } catch (err) {
    console.warn('[findMediaUsage] Error checking Team Members:', err.message);
  }

  // 5. Check GlobalSettings (Branding & SEO)
  try {
    const settings = await GlobalSettings.findOne().lean();
    if (settings) {
      const branding = settings.branding || {};
      const seo = settings.seoDefaults || {};

      if (urlsToCheck.includes(branding.logo)) {
        references.push({
          type: 'Global Settings',
          title: 'Branding Configuration',
          field: 'Brand Logo',
          id: settings._id.toString(),
        });
      }
      if (urlsToCheck.includes(branding.favicon)) {
        references.push({
          type: 'Global Settings',
          title: 'Branding Configuration',
          field: 'Favicon',
          id: settings._id.toString(),
        });
      }
      if (urlsToCheck.includes(branding.defaultOgImage) || urlsToCheck.includes(seo.defaultOgImage)) {
        references.push({
          type: 'Global Settings',
          title: 'SEO Defaults',
          field: 'Social Share Card (OG Image)',
          id: settings._id.toString(),
        });
      }
    }
  } catch (err) {
    console.warn('[findMediaUsage] Error checking Global Settings:', err.message);
  }

  // 6. Check WebsiteContent
  try {
    const contentDocs = await WebsiteContent.find({ isActive: true }).lean();
    for (const doc of contentDocs) {
      const contentStr = JSON.stringify(doc.content || {});
      const hasMatch = urlsToCheck.some((u) => contentStr.includes(u));
      if (hasMatch) {
        references.push({
          type: 'Website Content',
          title: `${doc.page.toUpperCase()} — ${doc.title || doc.section}`,
          field: 'Section Image',
          id: doc._id.toString(),
        });
      }
    }
  } catch (err) {
    console.warn('[findMediaUsage] Error checking WebsiteContent:', err.message);
  }

  return {
    inUse: references.length > 0,
    usageCount: references.length,
    references,
  };
}

module.exports = {
  findMediaUsage,
};
