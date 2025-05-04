const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for authentication
 * @param {Object} user - User object from database
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  // Create payload with user ID and role
  const payload = {
    id: user._id,
    role: user.role,
  };

  // Sign token with secret and set expiration
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

module.exports = { generateToken };