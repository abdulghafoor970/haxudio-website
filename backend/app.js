const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

const path = require('path');

// Load environment variables reliably from backend/.env or root (without overwriting existing runtime env)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

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

const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const apiRoutes = require('./routes');

// Initialize Express application
const app = express();

// Trust reverse proxy (Google Cloud Run / AI Studio environment)
app.set('trust proxy', 1);

// Security HTTP headers - scoped to /api and configured to allow iframe preview
app.use('/api', helmet({
  frameguard: false, // Prevents X-Frame-Options from blocking AI Studio iframe preview
  contentSecurityPolicy: false, // Prevents blocking Vite dev client, fonts, and scripts
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

// CORS configuration
const defaultOrigins = [
  'https://www.haxudio.com',
  'https://haxudio.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim().replace(/\/+$/, ''))
  : [];
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server, curl, health check tools)
    if (!origin) return callback(null, true);

    const isProduction = process.env.NODE_ENV === 'production';

    // In production mode: strictly validate origin against configured allowed origins
    if (isProduction) {
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: Origin not allowed in production.'));
    }

    // In development / preview mode: permit development and preview origins
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Request body parsers (Standard JSON API restricted to 500kb; media multipart uploads handled by Multer 10MB)
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Root informational endpoint for API
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Haxudio Digital Solutions REST API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Mount master API routes (/api/*)
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
