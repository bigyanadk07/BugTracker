const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details
  logger.error(`${err.name || 'Error'}: ${err.message || 'No message'}\nStack: ${err.stack || 'No stack'}`);

  // Fallback in case res is undefined or not ready
  if (!res || typeof res.status !== 'function') {
    console.error('Response object is not available or broken.');
    return;
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
