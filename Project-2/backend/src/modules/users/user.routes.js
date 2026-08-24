const express = require('express');
const userController = require('./user.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const {
  updateProfileSchema,
  updatePasswordSchema,
  userQuerySchema,
} = require('./user.validation');

const router = express.Router();

// User profile routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put('/password', authMiddleware, validate(updatePasswordSchema), userController.updatePassword);

// Admin-only user management route
router.get('/', authMiddleware, requireRole('admin'), validate(userQuerySchema), userController.listUsers);

module.exports = router;
