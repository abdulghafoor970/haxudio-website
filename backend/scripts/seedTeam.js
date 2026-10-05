const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const TeamMember = require('../models/TeamMember');
const defaultTeam = require('../data/defaultTeam');

async function seedTeam() {
  console.log('[Seed Team] Starting idempotent team members migration...');

  try {
    await connectDatabase();

    let createdCount = 0;
    let existingCount = 0;

    for (const member of defaultTeam) {
      const existing = await TeamMember.findOne({ name: member.name });
      if (!existing) {
        await TeamMember.create(member);
        createdCount++;
        console.log(`[Seed Team] + Created team member: ${member.name} (${member.position})`);
      } else {
        existingCount++;
        console.log(`[Seed Team] = Preserved existing team member: ${existing.name}`);
      }
    }

    console.log(`[Seed Team] Finished! ${createdCount} created, ${existingCount} already existed in MongoDB Atlas.`);
    return { createdCount, existingCount };
  } catch (err) {
    console.error('[Seed Team Error]:', err.message);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

// Execute when invoked directly from CLI
if (require.main === module) {
  seedTeam()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedTeam;
