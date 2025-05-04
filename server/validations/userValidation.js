const Joi = require('joi');

// Schema for user validation
const userSchema = Joi.object({
  name: Joi.string().required().trim().max(50)
    .messages({
      'string.empty': 'Name is required',
      'string.max': 'Name cannot be more than 50 characters',
      'any.required': 'Name is required',
    }),
  email: Joi.string().required().email().trim().lowercase()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required().min(6)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('User', 'Tester', 'Admin').default('User')
    .messages({
      'any.only': 'Role must be User, Tester, or Admin',
    }),
});

// Schema for login validation
const loginSchema = Joi.object({
  email: Joi.string().required().email().trim().lowercase()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

/**
 * Middleware to validate user registration
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }
  
  next();
};

/**
 * Middleware to validate user login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }
  
  next();
};

module.exports = { validateUser, validateLogin };