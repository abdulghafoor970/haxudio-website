const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const Testimonial = require('../models/Testimonial');
const defaultTestimonials = require('../data/defaultTestimonials');

async function seedTestimonials() {
  console.log('[Seed Testimonials] Starting idempotent testimonials migration...');

  try {
    await connectDatabase();

    let createdCount = 0;
    let existingCount = 0;

    for (const item of defaultTestimonials) {
      const existing = await Testimonial.findOne({ name: item.name });
      if (!existing) {
        await Testimonial.create(item);
        createdCount++;
        console.log(`[Seed Testimonials] + Created testimonial: ${item.name} (${item.company})`);
      } else {
        existingCount++;
        console.log(`[Seed Testimonials] = Preserved existing testimonial: ${existing.name}`);
      }
    }

    console.log(`[Seed Testimonials] Finished! ${createdCount} created, ${existingCount} already existed in MongoDB Atlas.`);
    return { createdCount, existingCount };
  } catch (err) {
    console.error('[Seed Testimonials Error]:', err.message);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

// Execute when invoked directly from CLI
if (require.main === module) {
  seedTestimonials()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedTestimonials;
