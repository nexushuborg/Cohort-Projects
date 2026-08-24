const { createForbiddenError, createUnauthorizedError } = require('../utils/errors');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createUnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}

module.exports = {
  requireRole,
};
