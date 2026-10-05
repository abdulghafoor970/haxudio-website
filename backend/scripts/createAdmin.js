/**
 * Admin Creation Script for Haxudio Digital Solutions
 *
 * Usage options:
 * 1. CLI arguments:
 *    node backend/scripts/createAdmin.js --name "Admin User" --email "admin@haxudio.com" --password "YourSecretPass123" --role "superadmin"
 *
 * 2. Interactive CLI prompt:
 *    node backend/scripts/createAdmin.js
 *
 * 3. Environment variables:
 *    INIT_ADMIN_NAME="Admin" INIT_ADMIN_EMAIL="admin@haxudio.com" INIT_ADMIN_PASSWORD="YourPassword" node backend/scripts/createAdmin.js
 *
 * Security:
 * - Passwords are automatically hashed via bcrypt in the Admin model pre-save hook.
 * - Passwords and secrets are never printed or saved to logs.
 */

const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables securely
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const Admin = require('../models/Admin');

// Helper to parse CLI flags (e.g., --name "John" --email "john@example.com")
const parseCliArgs = () => {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        params[key] = nextArg;
        i++;
      } else {
        params[key] = true;
      }
    }
  }

  return params;
};

// Interactive prompt utility
const promptUser = (query, isHidden = false) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (!isHidden) {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    } else {
      // Prompt for password
      process.stdout.write(query);
      let password = '';
      
      const onData = (char) => {
        char = char.toString('utf8');
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.pause();
            process.stdout.write('\n');
            process.stdin.removeListener('data', onData);
            rl.close();
            resolve(password.trim());
            break;
          case '\u0003': // Ctrl+C
            process.stdout.write('\n');
            process.exit(1);
            break;
          case '\u0008':
          case '\x7f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += char;
            process.stdout.write('*');
            break;
        }
      };

      process.stdin.resume();
      process.stdin.setRawMode(true);
      process.stdin.on('data', onData);
    }
  });
};

const run = async () => {
  console.log('========================================================');
  console.log('[Haxudio Admin Initialization Utility]');
  console.log('========================================================');

  const cliParams = parseCliArgs();

  let name = cliParams.name || process.env.INIT_ADMIN_NAME;
  let email = cliParams.email || process.env.INIT_ADMIN_EMAIL;
  let password = cliParams.password || process.env.INIT_ADMIN_PASSWORD;
  let role = cliParams.role || process.env.INIT_ADMIN_ROLE || 'superadmin';

  // If parameters weren't passed via CLI or env, ask interactively
  if (!email || !password) {
    if (!name) {
      name = await promptUser('Enter Admin Name: ');
    }
    if (!email) {
      email = await promptUser('Enter Admin Email: ');
    }
    if (!password) {
      password = await promptUser('Enter Admin Password (min 8 characters): ', true);
    }
  }

  // Fallback defaults and validation
  name = (name || 'Super Admin').trim();
  email = (email || '').toLowerCase().trim();
  password = (password || '').trim();
  role = (role === 'admin' ? 'admin' : 'superadmin');

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    console.error('[Error]: A valid email address is required.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('[Error]: Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    await connectDatabase();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(`[Notice]: Admin account with email "${email}" already exists.`);
      
      if (cliParams.update || cliParams.force) {
        console.log('[Action]: Updating existing administrator password and role...');
        existingAdmin.name = name;
        existingAdmin.password = password; // Will be re-hashed by pre-save hook
        existingAdmin.role = role;
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('[SUCCESS]: Administrator account updated successfully.');
      } else {
        console.log('[Information]: To update this user\'s password, rerun with "--update" flag.');
      }
    } else {
      // Create new administrator
      const newAdmin = new Admin({
        name,
        email,
        password, // Handled and hashed by Admin schema pre-save hook
        role,
        isActive: true,
      });

      await newAdmin.save();

      console.log('--------------------------------------------------------');
      console.log('[SUCCESS]: First administrator account created successfully!');
      console.log(`- Account ID: ${newAdmin._id}`);
      console.log(`- Full Name:  ${newAdmin.name}`);
      console.log(`- Email:      ${newAdmin.email}`);
      console.log(`- Role:       ${newAdmin.role}`);
      console.log(`- Status:     ${newAdmin.isActive ? 'Active' : 'Inactive'}`);
      console.log('--------------------------------------------------------');
    }
  } catch (error) {
    console.error('========================================================');
    console.error('[Error creating admin account]:', error.message);
    console.error('========================================================');
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

run();
