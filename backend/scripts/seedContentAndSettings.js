/**
 * IDEMPOTENT Seeder for WebsiteContent and GlobalSettings
 *
 * Rules:
 * - Creates ONLY missing sections and settings.
 * - NEVER overwrites existing admin-edited documents.
 * - Safe to run multiple times without duplicating data.
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const WebsiteContent = require('../models/WebsiteContent');
const GlobalSettings = require('../models/GlobalSettings');
const Admin = require('../models/Admin');
const { connectDatabase, disconnectDatabase } = require('../config/database');

const INITIAL_CONTENT_SECTIONS = [
  // --- HOME PAGE ---
  {
    page: 'home',
    section: 'hero',
    title: 'Homepage Hero Banner',
    content: {
      eyebrow: 'Quetta, Balochistan · Digital Solutions Agency',
      heading: 'Digital Solutions That Help Your Business Grow.',
      description: 'Haxudio Digital Solutions is a Quetta-based digital agency helping businesses across Balochistan and Pakistan build stronger digital brands through web development, digital marketing, SEO, branding, design, and modern technology solutions.',
      primaryCtaLabel: 'Build Your Quote',
      primaryCtaUrl: '/contact',
      secondaryCtaLabel: 'View Capabilities',
      secondaryCtaUrl: '/services',
      heroImageUrl: '/src/assets/images/hero_agency_studio_1790427835770.jpg',
      heroImageAlt: 'Haxudio Digital Solutions digital agency studio in Quetta Pakistan',
    },
  },
  {
    page: 'home',
    section: 'guarantee',
    title: 'Agency Positioning & Guarantee',
    content: {
      eyebrow: 'Our Guarantee',
      heading: 'Modern engineering tailored for Balochistan and expanding across Pakistan.',
      badge1: 'Zero Vulnerable Plugins',
      badge2: 'Sub-Second Page Speeds',
    },
  },
  {
    page: 'home',
    section: 'agencyIntro',
    title: 'Agency Introduction & Quetta Hub',
    content: {
      eyebrow: "Balochistan's Digital Partner",
      heading: 'Engineering Commercial Independence for Local Enterprises.',
      description: 'From our Quetta development hub, we engineer bespoke digital platforms, brand systems, and automated pipelines that deliver tangible customer inquiries. No generic templates—pure custom execution built to scale across Pakistan.',
      ctaLabel: 'Contact Quetta Office',
      ctaUrl: '/contact',
      hubImageUrl: '/src/assets/images/haxudio_quetta_hub_1790427878986.jpg',
      hubImageCaption: 'Haxudio Agency Studio — Quetta, Balochistan, Pakistan',
    },
  },
  {
    page: 'home',
    section: 'whyHaxudio',
    title: 'Why Choose Haxudio',
    content: {
      eyebrow: 'Why Haxudio',
      heading: 'Engineered for Results. Rooted in Accountability.',
      description: 'We believe regional businesses deserve world-class technical execution without agency bureaucracy.',
      points: [
        {
          title: 'Custom Code, Zero Bloat',
          description: 'Clean Next.js/React frontends with sub-second mobile load times on local 4G networks.',
        },
        {
          title: 'Local Presence, National Delivery',
          description: 'Direct face-to-face accountability in Quetta with execution capacity across Pakistan.',
        },
        {
          title: 'Full Commercial Transparency',
          description: 'Clear deliverable milestones, documented handover, and verified conversion metrics.',
        },
      ],
    },
  },
  {
    page: 'home',
    section: 'finalCta',
    title: 'Homepage Final Call to Action',
    content: {
      eyebrow: 'Start Your Project',
      heading: 'Ready to Elevate Your Digital Footprint?',
      description: 'Schedule a discovery consultation with our Quetta engineering leads. We review your requirements and provide an itemized project scope within 24 hours.',
      buttonLabel: 'Start a Conversation',
      buttonUrl: '/contact',
    },
  },

  // --- ABOUT PAGE ---
  {
    page: 'about',
    section: 'hero',
    title: 'About Page Hero',
    content: {
      eyebrow: 'Rooted in Quetta, Balochistan · Serving All of Pakistan',
      heading: 'Building Digital Products with Pride, Integrity, and Craftsmanship.',
      description: 'Haxudio Digital Solutions was founded to solve a persistent challenge: businesses in Quetta and Balochistan deserve the same standard of software engineering, editorial design, and digital growth infrastructure enjoyed by leading global enterprises.',
    },
  },
  {
    page: 'about',
    section: 'story',
    title: 'Agency Narrative & Origin',
    content: {
      heading: 'Who We Are',
      paragraph1: 'We are an independent digital solutions agency composed of frontend engineers, visual designers, SEO strategists, and growth advisors based in Quetta.',
      paragraph2: 'Too many regional businesses were sold bloated WordPress themes packed with 50 unstable plugins that crash on mobile 4G networks. We set out to change that by engineering lightweight, accessible web applications built from scratch with clean modern technologies like React and modular Tailwind CSS.',
      paragraph3: 'From our office on Brewery Road in Quetta, we partner with healthcare facilities, artisan craft brands, hospitality groups, educational centers, and commercial suppliers across Balochistan, Karachi, Lahore, and Islamabad.',
      imageUrl: '/src/assets/images/haxudio_quetta_hub_1790427878986.jpg',
      imageCaption: 'Haxudio Agency Studio — Quetta, Balochistan, Pakistan',
    },
  },
  {
    page: 'about',
    section: 'mission',
    title: 'Our Mission Statement',
    content: {
      eyebrow: 'Our Mission',
      heading: 'To Engineer Enduring Digital Assets',
      description: 'Our mission is to help Pakistani businesses transition from transient social posts and fragile templates to high-speed, secure, and enduring digital platforms that drive verifiable inbound inquiries, customer retention, and commercial independence.',
    },
  },
  {
    page: 'about',
    section: 'vision',
    title: 'Our Vision',
    content: {
      eyebrow: 'Our Vision',
      heading: 'Elevating the Digital Standard in Balochistan',
      description: 'We envision Quetta as a recognized center of software excellence and creative industry within Pakistan—proving that world-class design and engineering can be built right here in the heart of Balochistan.',
    },
  },
  {
    page: 'about',
    section: 'values',
    title: 'Core Values & Principles',
    content: {
      eyebrow: 'Our Principles',
      heading: 'The Values That Guide Every Decision.',
      description: 'We believe in straightforward contracts, radical technical transparency, and measurable business value.',
      items: [
        {
          number: '01',
          title: 'Engineering Rigor Over Hacks',
          description: 'We write semantic, modular code with zero shortcuts, ensuring security and long-term maintainability.',
        },
        {
          number: '02',
          title: 'Transparent Partnerships',
          description: 'Direct communication with the engineers and designers executing your project, without corporate buffers.',
        },
        {
          number: '03',
          title: 'Commercial Impact',
          description: 'Design and code tailored specifically to convert regional visitors into active commercial inquiries.',
        },
      ],
    },
  },
  {
    page: 'about',
    section: 'finalCta',
    title: 'About Page Final Call to Action',
    content: {
      heading: 'Ready to Build Something Remarkable?',
      description: 'Whether you need a bespoke web platform, an eCommerce engine, or a full rebrand, our Quetta team is ready to deliver.',
      buttonLabel: 'Build Your Quote',
      buttonUrl: '/contact',
    },
  },

  // --- CONTACT PAGE ---
  {
    page: 'contact',
    section: 'hero',
    title: 'Contact Page Hero & Introduction',
    content: {
      eyebrow: 'Start a Conversation · Quetta, Balochistan, Pakistan',
      heading: 'Contact Haxudio Digital Solutions.',
      leadText: 'Looking for a digital agency in Quetta or a reliable digital solutions partner in Pakistan? Get in touch with Haxudio Digital Solutions to discuss your project.',
      description: 'Have a clear project specification or simply exploring possibilities for your brand? Reach out directly via WhatsApp, phone, or our inquiry form below. Our Quetta engineering and design team reviews every request within 24 hours.',
    },
  },
  {
    page: 'contact',
    section: 'supporting',
    title: 'Contact Supporting Details',
    content: {
      formHeading: 'Project Discovery & Quote Request',
      formSubheading: 'Fill in the parameters below. We respect your confidentiality and never share client data.',
      responseTimePromise: 'Direct engineer response guaranteed within 24 hours.',
      locationHeading: 'Quetta Headquarters',
      hoursHeading: 'Business Operating Hours',
    },
  },
];

const INITIAL_GLOBAL_SETTINGS = {
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
    defaultKeywords: ['Digital agency Quetta', 'Web development Pakistan', 'SEO Balochistan', 'Software house Quetta'],
    defaultOgImage: 'https://www.haxudio.com/og-image.jpg',
    canonicalBase: 'https://www.haxudio.com/',
  },
  isActive: true,
};

async function seedContentAndSettings() {
  console.log('[Phase 3E Seed] Starting idempotent check for missing content and settings...');

  await connectDatabase();

  const admin = await Admin.findOne();
  const adminId = admin?._id || null;

  // 1. Check & Seed WebsiteContent (ONLY missing sections)
  let createdCount = 0;
  let skippedCount = 0;

  for (const item of INITIAL_CONTENT_SECTIONS) {
    const existing = await WebsiteContent.findOne({ page: item.page, section: item.section });
    if (!existing) {
      await WebsiteContent.create({
        ...item,
        isActive: true,
        updatedBy: adminId,
      });
      createdCount++;
      console.log(`[Phase 3E Seed] Created missing section: [${item.page}] -> ${item.section}`);
    } else {
      skippedCount++;
    }
  }

  // 2. Check & Seed GlobalSettings (ONLY if not already present)
  let settingsCreated = false;
  const existingSettings = await GlobalSettings.findOne();
  if (!existingSettings) {
    await GlobalSettings.create({
      ...INITIAL_GLOBAL_SETTINGS,
      updatedBy: adminId,
    });
    settingsCreated = true;
    console.log('[Phase 3E Seed] Created initial GlobalSettings document.');
  } else {
    console.log('[Phase 3E Seed] Existing GlobalSettings document preserved.');
  }

  console.log(`[Phase 3E Seed] Summary: ${createdCount} sections created, ${skippedCount} existing sections preserved. Settings created: ${settingsCreated}.`);

  await disconnectDatabase();
}

if (require.main === module) {
  seedContentAndSettings()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Phase 3E Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = seedContentAndSettings;
