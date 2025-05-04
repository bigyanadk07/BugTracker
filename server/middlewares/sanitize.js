const mongoSanitize = require('express-mongo-sanitize');

/**
 * Middleware to sanitize user input to prevent NoSQL injection
 * This replaces prohibited characters like $ and . in the request body, query, and params
 */
const sanitize = mongoSanitize();

module.exports = sanitize;  