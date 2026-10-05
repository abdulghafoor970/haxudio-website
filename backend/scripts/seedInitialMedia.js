const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const Media = require('../models/Media');

const LOCAL_IMAGES_METADATA = [
  {
    file: 'hero_agency_studio_1790427835770.jpg',
    folder: 'haxudio/content',
    title: 'Haxudio Agency Studio Workspace',
    altText: 'Haxudio Digital Solutions modern agency studio in Quetta, Balochistan',
    caption: 'Modern tech studio workstation and engineering hub.',
  },
  {
    file: 'haxudio_quetta_hub_1790427878986.jpg',
    folder: 'haxudio/content',
    title: 'Haxudio Quetta Engineering Hub',
    altText: 'Haxudio technology engineering hub and client collaboration space in Quetta',
    caption: 'Our primary software engineering center located in Quetta.',
  },
  {
    file: 'service_web_engineering_1790427847817.jpg',
    folder: 'haxudio/services',
    title: 'Custom Web & Application Engineering',
    altText: 'Modern web engineering architecture, Next.js, and high performance apps',
    caption: 'Cover visual for custom web engineering capability.',
  },
  {
    file: 'service_ai_automation_1790432528982.jpg',
    folder: 'haxudio/services',
    title: 'AI Solutions & Workflow Automation',
    altText: 'Artificial intelligence integrations, workflow automation, and custom LLM solutions',
    caption: 'Cover visual for AI & intelligent automation solutions.',
  },
  {
    file: 'service_digital_marketing_1790432503646.jpg',
    folder: 'haxudio/services',
    title: 'Digital Marketing & Growth Strategy',
    altText: 'Targeted performance marketing, omnichannel campaigns, and conversion optimization',
    caption: 'Cover visual for data-driven growth marketing.',
  },
  {
    file: 'service_seo_analytics_1790432517421.jpg',
    folder: 'haxudio/services',
    title: 'Technical SEO & Data Analytics',
    altText: 'Enterprise SEO audits, semantic search optimization, and web performance tracking',
    caption: 'Cover visual for technical search engine optimization.',
  },
  {
    file: 'service_uiux_design_1790432543687.jpg',
    folder: 'haxudio/services',
    title: 'UI/UX Design Systems & Branding',
    altText: 'Bespoke user interface design, wireframes, prototypes, and corporate design tokens',
    caption: 'Cover visual for product interface design and UX architecture.',
  },
  {
    file: 'service_social_media_1790432556891.jpg',
    folder: 'haxudio/services',
    title: 'Social Media Strategy & Content',
    altText: 'Strategic social media storytelling, short-form video production, and community engagement',
    caption: 'Cover visual for brand presence and audience development.',
  },
  {
    file: 'service_video_editing_1790432567917.jpg',
    folder: 'haxudio/services',
    title: 'Commercial Video Production & Editing',
    altText: 'Cinematic corporate video editing, motion graphics, and audio mastering',
    caption: 'Cover visual for studio video editing and commercial reels.',
  },
  {
    file: 'project_hospital_portal_1790431541258.jpg',
    folder: 'haxudio/projects',
    title: 'Bolan Medical Health Portal Case Study',
    altText: 'Secure digital patient management portal and tele-health infrastructure',
    caption: 'Bolan Medical Health Portal user dashboard showcase.',
  },
  {
    file: 'project_bolan_branding_1790431558650.jpg',
    folder: 'haxudio/projects',
    title: 'Bolan Mining Logistics Brand Identity',
    altText: 'Corporate visual identity, typography system, and fleet branding for mineral export',
    caption: 'Comprehensive brand identity for regional mineral export enterprise.',
  },
  {
    file: 'project_chiltan_hotel_1790431573419.jpg',
    folder: 'haxudio/projects',
    title: 'Chiltan Luxury Hotel Booking Engine',
    altText: 'Bespoke direct booking portal, reservation calendar, and room visualizer in Ziarat',
    caption: 'Luxury hospitality booking engine and resort management system.',
  },
  {
    file: 'project_branding_case_1790427864484.jpg',
    folder: 'haxudio/projects',
    title: 'Corporate Brand Transformation Case Study',
    altText: 'Clean modern brand identity package and editorial collateral',
    caption: 'Identity redesign and digital touchpoints for corporate enterprise.',
  },
  {
    file: 'cofounder_tech_lead_1790429560393.jpg',
    folder: 'haxudio/team',
    title: 'Hamza Kakar — Co-Founder & Technical Lead',
    altText: 'Hamza Kakar, co-founder and full-stack systems architect at Haxudio Digital Solutions',
    caption: 'Technical director and systems architect.',
  },
  {
    file: 'cofounder_design_director_1790429577508.jpg',
    folder: 'haxudio/team',
    title: 'Zainab Baloch — Co-Founder & Head of Product Design',
    altText: 'Zainab Baloch, co-founder and design director at Haxudio Digital Solutions',
    caption: 'Design director overseeing brand, typography, and interface craftsmanship.',
  },
  {
    file: 'cofounder_growth_lead_1790429593024.jpg',
    folder: 'haxudio/team',
    title: 'Mirza Tariq — Head of Growth & Client Success',
    altText: 'Mirza Tariq, client partnership director and performance marketing lead at Haxudio',
    caption: 'Leading strategic client expansion and regional enterprise partnerships.',
  },
  {
    file: 'cofounder_operations_lead_1790430621259.jpg',
    folder: 'haxudio/team',
    title: 'Ayesha Raisani — Operations & Delivery Director',
    altText: 'Ayesha Raisani, agile delivery director and quality assurance head at Haxudio',
    caption: 'Directing delivery timelines, QA standards, and client project milestones.',
  },
];

async function seedInitialMedia() {
  console.log('[Seed Initial Media] Starting idempotent media registration...');

  try {
    await connectDatabase();

    let createdCount = 0;
    let existingCount = 0;

    for (const item of LOCAL_IMAGES_METADATA) {
      const publicId = `local_${item.file.replace(/\.[^/.]+$/, '')}`;
      const url = `/src/assets/images/${item.file}`;

      const existing = await Media.findOne({
        $or: [{ publicId }, { url }, { filename: item.file }],
      });

      if (!existing) {
        await Media.create({
          filename: item.file,
          originalFilename: item.file,
          provider: 'local',
          publicId,
          url,
          secureUrl: url,
          resourceType: 'image',
          format: 'jpg',
          mimeType: 'image/jpeg',
          width: 1200,
          height: 800,
          bytes: 180000,
          altText: item.altText,
          title: item.title,
          caption: item.caption,
          folder: item.folder,
          isActive: true,
        });
        createdCount++;
        console.log(`[Seed Media] + Registered: ${item.title} (${item.folder})`);
      } else {
        existingCount++;
        console.log(`[Seed Media] = Already indexed: ${existing.title}`);
      }
    }

    console.log(`[Seed Initial Media] Complete! ${createdCount} registered, ${existingCount} already present.`);
    return { createdCount, existingCount };
  } catch (err) {
    console.error('[Seed Initial Media Error]:', err.message);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  seedInitialMedia()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedInitialMedia;
