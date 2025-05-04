const jwt = require('jsonwebtoken');

/**
 * Validate and decode JWT token
 * @param {String} token - JWT token to validate
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const validateToken = (token) => {
  try {
    // Verify token with secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return decoded;
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token validation failed');
    }
  }
};

module.exports = { validateToken };