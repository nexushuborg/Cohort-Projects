const { createForbiddenError, createUnauthorizedError } = require('../utils/errors');

function requireRole(...roles) {
  const flattenedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return next(createUnauthorizedError('Authentication required'));
    }

    if (!flattenedRoles.includes(req.user.role)) {
      return next(createForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}

module.exports = requireRole;
module.exports.requireRole = requireRole;
