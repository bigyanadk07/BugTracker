/**
 * Wraps async route handlers and passes errors to the global error handler
 * @param {Function} fn - The async route function
 */
const asyncHandler = (fn) => {
    return function (req, res, next) {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = asyncHandler;
  