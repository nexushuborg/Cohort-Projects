const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { createUnauthorizedError, createForbiddenError } = require('../utils/errors');

function authMiddleware(req, res, next) {
  try {
    // In development mode, allow test user headers if provided
    if ((env.nodeEnv === 'development' || env.NODE_ENV === 'development') && req.headers['x-dev-user-id']) {
      const devId = req.headers['x-dev-user-id'];
      req.user = {
        id: devId,
        sub: devId,
        email: req.headers['x-dev-user-email'] || 'dev@test.com',
        role: req.headers['x-dev-user-role'] || 'buyer',
        name: req.headers['x-dev-user-name'] || 'Dev User',
      };
      return next();
    }

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError('Authentication token is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw createUnauthorizedError('Authentication token is missing');
    }

    const secret = env.jwtSecret || env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    const userId = decoded.sub || decoded.id;
    req.user = {
      id: userId,
      sub: userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(createUnauthorizedError('Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(createUnauthorizedError('Invalid token'));
    }
    next(error);
  }
}

// Export as both named and default for compatibility
module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
