const mongoose = require('mongoose');

/**
 * Safely parses and cleans the MongoDB connection URI from environment variables
 */
const getCleanMongoUri = () => {
  let uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string') return '';

  uri = uri.trim();
  // Strip any accidental variable assignment prefix (e.g. MONGODB_URI=mongodb+srv://...)
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.replace(/^MONGODB_URI=\s*/, '');
  }
  // Strip surrounding quotes
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
};

/**
 * Connect to MongoDB Atlas via Mongoose
 *
 * Requirements:
 * - Uses MONGODB_URI from environment variables.
 * - Handles successful connection.
 * - Handles connection errors and rejects promise (prevents silent failure).
 * - Graceful shutdown and disconnection support.
 * - Keeps database logic separate from controllers and routes.
 */
const connectDatabase = async () => {
  const uri = getCleanMongoUri();

  if (uri) {
    process.env.MONGODB_URI = uri;
  }

  if (!uri || !uri.trim()) {
    const errorMsg = 'MONGODB_URI is not defined. Please set MONGODB_URI in your backend/.env file.';
    console.error(`[MongoDB Config Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Check if placeholder password was left unreplaced
  if (uri.includes(':YOUR_PASSWORD@') || uri.includes(':<password>@')) {
    const errorMsg = 'MONGODB_URI contains placeholder ":YOUR_PASSWORD@". Please replace it with your actual MongoDB Atlas database user password in backend/.env.';
    console.error(`[MongoDB Config Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Mongoose connection options for reliability on cloud clusters
  const connectionOptions = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging indefinitely
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
  };

  try {
    const conn = await mongoose.connect(uri, connectionOptions);
    console.log(`[MongoDB] Successfully connected to MongoDB Atlas!`);
    console.log(`[MongoDB] Cluster Host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Failed to connect to MongoDB Atlas: ${error.message}`);

    if (error.message.includes('IP that isn\'t whitelisted') || error.message.includes('SSL alert number 80')) {
      console.error('--------------------------------------------------------');
      console.error('[MongoDB Atlas Action Required]:');
      console.error('Atlas rejected the connection. Please verify two things in cloud.mongodb.com:');
      console.error('1. Network Access: Ensure 0.0.0.0/0 ("Allow Access from Anywhere") is added to your IP Access List.');
      console.error('2. Database Credentials: Verify the database username and password in backend/.env match your Atlas user.');
      console.error('--------------------------------------------------------');
    }

    throw error;
  }
};

/**
 * Disconnect from MongoDB Atlas gracefully
 */
const disconnectDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log('[MongoDB] Connection closed gracefully.');
    }
  } catch (error) {
    console.error(`[MongoDB] Error closing database connection: ${error.message}`);
  }
};

// Event listeners for runtime monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost: Disconnected from MongoDB Atlas.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Connection restored: Reconnected to MongoDB Atlas.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime connection error: ${err.message}`);
});

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
