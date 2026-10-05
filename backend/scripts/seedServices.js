const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const Service = require('../models/Service');
const defaultServices = require('../data/defaultServices');

async function seedServices() {
  console.log('[Seed Services] Starting idempotent services migration...');

  try {
    await connectDatabase();

    let createdCount = 0;
    let existingCount = 0;

    for (const serviceData of defaultServices) {
      const existing = await Service.findOne({ slug: serviceData.slug });
      if (!existing) {
        await Service.create(serviceData);
        createdCount++;
        console.log(`[Seed Services] + Created service: ${serviceData.title} (${serviceData.slug})`);
      } else {
        existingCount++;
        console.log(`[Seed Services] = Preserved existing service: ${existing.title} (${existing.slug})`);
      }
    }

    console.log(`[Seed Services] Finished! ${createdCount} created, ${existingCount} already existed.`);
    return { createdCount, existingCount };
  } catch (err) {
    console.error('[Seed Services Error]:', err.message);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

// Execute when invoked directly from CLI
if (require.main === module) {
  seedServices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedServices;
