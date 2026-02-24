const { validationResult } = require('express-validator');

/**
 * Validation middleware
 * Checks for validation errors and returns them
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Sanitize user input
 * Removes potentially dangerous characters
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS prevention
        req.body[key] = req.body[key]
          .replace(/</g, '<')
          .replace(/>/g, '>');
      }
    }
  }
  next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  req.query.page = parseInt(req.query.page) || 1;
  req.query.limit = Math.min(parseInt(req.query.limit) || 10, 100);
  
  if (req.query.page < 1) req.query.page = 1;
  if (req.query.limit < 1) req.query.limit = 10;
  
  next();
};

module.exports = {
  validate,
  sanitizeInput,
  validateObjectId,
  validatePagination
};