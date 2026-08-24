const { sendError } = require('../utils/response.util');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Handle known PostgreSQL Database Errors
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    code = 'CONFLICT';
    message = err.detail || 'A record with this information already exists';
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Referenced resource does not exist';
  } else if (err.code === '22P02') { // Invalid text representation (e.g. invalid UUID)
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid ID format provided';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Token has expired';
  }

  // In production, mask unhandled 500 error messages
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal server error occurred';
  }

  return sendError(res, { code, message, details }, statusCode);
}

function notFoundHandler(req, res, next) {
  return sendError(
    res,
    {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
    404
  );
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
