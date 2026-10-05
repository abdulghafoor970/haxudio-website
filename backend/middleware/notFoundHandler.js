/**
 * 404 Route Not Found Middleware
 * Intercepts requests that do not match any registered API routes.
 */
const notFoundHandler = (req, res, next) => {
  // If request is targeted at the API namespace, return JSON 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl} - API endpoint not found`,
    });
  }

  // Non-API routes pass through to frontend/Vite handler
  next();
};

module.exports = notFoundHandler;
