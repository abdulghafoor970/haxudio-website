const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const Project = require('../models/Project');
const defaultProjects = require('../data/defaultProjects');

async function seedProjects() {
  console.log('[Seed Projects] Starting idempotent portfolio projects migration...');

  try {
    await connectDatabase();

    let createdCount = 0;
    let existingCount = 0;

    for (const projectData of defaultProjects) {
      const existing = await Project.findOne({ slug: projectData.slug });
      if (!existing) {
        await Project.create(projectData);
        createdCount++;
        console.log(`[Seed Projects] + Created project: ${projectData.title} (${projectData.slug})`);
      } else {
        existingCount++;
        console.log(`[Seed Projects] = Preserved existing project: ${existing.title} (${existing.slug})`);
      }
    }

    console.log(`[Seed Projects] Finished! ${createdCount} created, ${existingCount} already existed in MongoDB Atlas.`);
    return { createdCount, existingCount };
  } catch (err) {
    console.error('[Seed Projects Error]:', err.message);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

// Execute when invoked directly from CLI
if (require.main === module) {
  seedProjects()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedProjects;
