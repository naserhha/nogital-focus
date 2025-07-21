const { body, validationResult } = require('express-validator');

// Email validation rules
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),
  
  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Rate limiting validation
const validateRateLimit = (req, res, next) => {
  // This will be handled by express-rate-limit middleware
  next();
};

module.exports = {
  validateEmail,
  validateRateLimit
}; 