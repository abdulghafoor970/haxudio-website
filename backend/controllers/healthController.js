const mongoose = require('mongoose');

/**
 * Health Check Controller
 * Returns server operational status, environment, uptime, and database connectivity.
 */
const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isConnected = dbState === 1;

  const isProduction = process.env.NODE_ENV === 'production';

  const dbInfo = {
    status: dbStatusMap[dbState] || 'unknown',
    connected: isConnected,
  };

  // Only include internal cluster details in development mode
  if (!isProduction && isConnected) {
    dbInfo.host = mongoose.connection.host;
    dbInfo.name = mongoose.connection.name;
  }

  res.status(200).json({
    status: isConnected ? 'healthy' : 'degraded',
    message: 'Haxudio Digital Solutions API is operational',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbInfo,
    version: '1.0.0',
  });
};

module.exports = {
  getHealth,
};
