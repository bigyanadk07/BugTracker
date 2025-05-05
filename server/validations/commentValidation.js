const { body, validationResult } = require('express-validator');

/**
 * Validate comment input
 */
const validateCommentInput = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot be more than 500 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = validateCommentInput;