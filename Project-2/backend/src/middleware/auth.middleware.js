/**
 * AUTH MIDDLEWARE PLACEHOLDER
 * 
 * This file is a placeholder for Person 1's authentication implementation.
 * 
 * Expected interface:
 * - Reads JWT from Authorization header (Bearer token)
 * - Verifies the token
 * - Attaches user payload to req.user
 * - Returns 401 if no token, 403 if invalid
 * 
 * Expected req.user shape:
 * {
 *   sub: "user-uuid",
 *   email: "user@example.com",
 *   role: "buyer" | "seller" | "admin"
 * }
 * 
 * DO NOT use this placeholder in production.
 * Person 1 must replace this with real JWT verification.
 */

const env = require('../config/env');

// Temporary development-only middleware that reads user from header
// REMOVE this and replace with real JWT auth from Person 1
module.exports = function authenticateToken(req, res, next) {
  // In development without Person 1's auth, allow setting user via headers
  if (env.nodeEnv === 'development' && req.headers['x-dev-user-id']) {
    req.user = {
      sub: req.headers['x-dev-user-id'],
      email: req.headers['x-dev-user-email'] || 'dev@test.com',
      role: req.headers['x-dev-user-role'] || 'buyer',
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Access token required' },
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const user = jwt.verify(token, env.jwtSecret);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or expired access token' },
    });
  }
};
