import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load backend environment variables reliably
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env'), override: true });
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Express application and DB connection from backend
import backendApp from './backend/app.js';
import { connectDatabase, disconnectDatabase } from './backend/config/database.js';

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  console.log('[Full-Stack Server] Initializing Haxudio React Vite + Express server...');

  const app = express();

  // Trust reverse proxy (Google Cloud Run / AI Studio environment)
  app.set('trust proxy', 1);

  // Security Headers: In production, enforce strict CSP, HSTS, and frame protection.
  // In development / preview, permit iframe preview for AI Studio.
  if (isProduction) {
    // Content Security Policy crafted specifically for Haxudio's required resources:
    // - style-src requires 'unsafe-inline' due to React/Tailwind dynamic style attributes and Motion transforms
    // - font-src requires Google Fonts CDN (fonts.gstatic.com)
    // - img-src requires self, data: URIs, and Cloudinary media delivery
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
      "connect-src 'self' https://res.cloudinary.com https://*.cloudinary.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    app.use((req, res, next) => {
      res.setHeader('Content-Security-Policy', cspDirectives);
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    });
  } else {
    // Development / AI Studio preview: explicitly strip frame-blocking headers
    app.use((req, res, next) => {
      res.removeHeader('X-Frame-Options');
      next();
    });
  }

  // Serve static raw assets directly from src/assets with moderate caching
  app.use('/src/assets', express.static(path.resolve(process.cwd(), 'src/assets'), { maxAge: '7d' }));

  // Mount backend Express application containing /api/* routes
  app.use(backendApp);

  // Frontend Serving (Vite in development, dist in production)
  if (!isProduction) {
    // In dev: also map /assets to local assets if referenced
    app.use('/assets', express.static(path.resolve(process.cwd(), 'src/assets'), { maxAge: '1d' }));

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Frontend] Vite React development middleware attached to port 3000.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const distAssetsPath = path.join(distPath, 'assets');

    // 1. Fingerprinted/hashed Vite production assets: long-lived immutable caching
    app.use('/assets', express.static(distAssetsPath, {
      maxAge: '1y',
      immutable: true,
      fallthrough: false,
    }));

    // 2. Static root assets (favicon, etc.) in dist
    app.use(express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
      },
    }));

    // 3. SPA fallback: always serve index.html with revalidation headers
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Frontend] Serving compiled production React build from dist/ with immutable asset caching.');
  }

  // Bind and listen to PORT
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Full-Stack Server] Haxudio server listening on http://0.0.0.0:${PORT}`);
    console.log(`[Mode]: ${isProduction ? 'Production (Static Dist)' : 'Development (Vite Live HMR)'}`);
  });

  // Asynchronously connect to MongoDB Atlas
  connectDatabase()
    .then(() => {
      console.log('[Full-Stack Server] MongoDB Atlas connection established successfully.');
    })
    .catch((err) => {
      console.warn('[Full-Stack Server] Warning: Could not connect to MongoDB Atlas immediately:', err.message);
    });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[Full-Stack Server] Received ${signal}. Shutting down cleanly...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('[Full-Stack Server] Server and DB closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Full-Stack Server] Critical initialization error:', err);
  process.exit(1);
});
