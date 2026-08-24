const express = require('express');
const router = express.Router();
const controller = require('./product.controller');
const validate = require('../../middleware/validate.middleware');
const { validateParams, validateQuery } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const { createProductSchema, updateProductSchema, storeProductsParamsSchema, storeProductsQuerySchema } = require('./product.validation');

// ─── Public Routes ──────────────────────────────────────────────

// GET /products — List all products (public, with filters & pagination)
router.get('/', controller.getAll);

// GET /products/store/:storeId — Get products by store (public)
router.get('/store/:storeId',
  validateParams(storeProductsParamsSchema),
  validateQuery(storeProductsQuerySchema),
  controller.getByStoreId
);

// GET /products/:id — Get product details (public)
router.get('/:id', controller.getById);

// ─── Protected Routes (Seller) ──────────────────────────────────

// POST /products — Create a new product (seller only)
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.post('/', authenticateToken, requireRole('seller'), validate(createProductSchema), controller.create);
router.post('/', validate(createProductSchema), controller.create);

// PUT /products/:id — Update a product (seller, owner only)
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.put('/:id', authenticateToken, requireRole('seller'), validate(updateProductSchema), controller.update);
router.put('/:id', validate(updateProductSchema), controller.update);

// DELETE /products/:id — Delete a product (seller, owner only)
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.delete('/:id', authenticateToken, requireRole('seller'), controller.remove);
router.delete('/:id', controller.remove);

module.exports = router;
