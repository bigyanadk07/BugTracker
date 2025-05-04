const Joi = require('joi');

// Schema for bug validation
const bugSchema = Joi.object({
  title: Joi.string().required().trim().max(100)
    .messages({
      'string.empty': 'Bug title is required',
      'string.max': 'Title cannot be more than 100 characters',
      'any.required': 'Bug title is required',
    }),
  description: Joi.string().allow('').trim().max(1000)
    .messages({
      'string.max': 'Description cannot be more than 1000 characters',
    }),
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium')
    .messages({
      'any.only': 'Priority must be Low, Medium, or High',
    }),
  status: Joi.string().valid('Open', 'In Progress', 'Closed').default('Open')
    .messages({
      'any.only': 'Status must be Open, In Progress, or Closed',
    }),
  assignedTo: Joi.string().allow(null, ''),
});

/**
 * Middleware to validate bug input
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateBug = (req, res, next) => {
  const { error } = bugSchema.validate(req.body);
  
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }
  
  next();
};

module.exports = validateBug;