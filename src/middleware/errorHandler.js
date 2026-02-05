const logger = require('../utils/logger');
const { z } = require('zod');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the error
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // 1. Validation Errors (Zod)
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors,
    });
  }

  // 2. MongoDB Duplicate Key Error
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate value entered',
    });
  }

  // 3. MongoDB Invalid ID (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // 4. Default Server Error
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
