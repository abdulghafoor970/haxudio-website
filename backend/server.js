const dotenv = require('dotenv');
const path = require('path');

// Load environment variables exclusively on the backend
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env'), override: true });
dotenv.config(); // fallback to root .env if present

// Normalize MONGODB_URI if passed with variable name prefix or surrounding quotes
if (process.env.MONGODB_URI && typeof process.env.MONGODB_URI === 'string') {
  let cleaned = process.env.MONGODB_URI.trim();
  if (cleaned.startsWith('MONGODB_URI=')) {
    cleaned = cleaned.replace(/^MONGODB_URI=\s*/, '');
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  process.env.MONGODB_URI = cleaned;
}

const app = require('./app');
const { connectDatabase, disconnectDatabase } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Initialize Server & Database
const startServer = async () => {
  try {
    console.log('========================================================');
    console.log('[Haxudio API] Initializing backend services...');
    console.log(`[Haxudio API] Mode: ${process.env.NODE_ENV || 'development'}`);

    // Connect to MongoDB Atlas (fails fast if connection cannot be established)
    await connectDatabase();

    // Start Express HTTP Server only after successful DB connection
    const server = app.listen(PORT, () => {
      console.log(`[Haxudio API] Server is live and listening on port: ${PORT}`);
      console.log(`[Haxudio API] Health status: http://localhost:${PORT}/api/health`);
      console.log('========================================================');
    });

    // Graceful Shutdown
    const handleGracefulShutdown = async (signal) => {
      console.log(`\n[Haxudio API] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('[Haxudio API] HTTP server closed.');
        await disconnectDatabase();
        console.log('[Haxudio API] Cleanup complete. Process exiting.');
        process.exit(0);
      });

      // Force shutdown after 10s if connections linger
      setTimeout(() => {
        console.error('[Haxudio API] Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('========================================================');
    console.error('[Haxudio API] FATAL: Database startup failure!');
    console.error(`[Error Details]: ${error.message}`);
    console.error('[Action Required]: Please configure a valid MONGODB_URI in your backend/.env file.');
    console.error('Process terminated to prevent silent data failure.');
    console.error('========================================================');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

startServer();
