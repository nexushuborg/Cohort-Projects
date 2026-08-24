const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { createUnauthorizedError } = require('../utils/errors');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError('Authentication token is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw createUnauthorizedError('Authentication token is missing');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      id: decoded.sub || decoded.id,
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

module.exports = {
  authMiddleware,
};
