/**
 * RBAC MIDDLEWARE PLACEHOLDER
 * 
 * This file is a placeholder for Person 1's role-based access control.
 * 
 * Expected interface:
 * requireRole('seller') - returns middleware that checks req.user.role
 * requireRole('admin') - returns middleware that checks req.user.role
 * 
 * Usage in routes:
 *   router.post('/', authenticateToken, requireRole('seller'), controller.create);
 * 
 * Person 1 must replace this with real RBAC implementation.
 */

module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    next();
  };
};
