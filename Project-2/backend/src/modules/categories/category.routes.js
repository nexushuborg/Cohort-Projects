const express = require('express');
const categoryController = require('./category.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} = require('./category.validation');

const router = express.Router();

// Public routes
router.get('/', categoryController.listCategories);
router.get('/:id', validate(categoryIdSchema), categoryController.getCategory);

// Admin-only protected routes
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validate(categoryIdSchema),
  categoryController.deleteCategory
);

module.exports = router;
