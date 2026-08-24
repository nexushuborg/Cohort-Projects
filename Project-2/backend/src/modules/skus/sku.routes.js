const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('./sku.controller');
const validate = require('../../middleware/validate.middleware');
const { validateParams } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const { productParamsSchema, skuParamsSchema, createSkuSchema, updateSkuSchema } = require('./sku.validation');

// GET /products/:productId/skus — List all SKUs for a product
router.get('/',
  validateParams(productParamsSchema),
  controller.getAll
);

// GET /products/:productId/skus/:skuId — Get SKU with variant options
router.get('/:skuId',
  validateParams(skuParamsSchema),
  controller.getById
);

// POST /products/:productId/skus — Create a SKU
router.post('/',
  authenticateToken, requireRole('seller', 'admin'),
  validateParams(productParamsSchema),
  validate(createSkuSchema),
  controller.create
);

// PUT /products/:productId/skus/:skuId — Update a SKU
router.put('/:skuId',
  authenticateToken, requireRole('seller', 'admin'),
  validateParams(skuParamsSchema),
  validate(updateSkuSchema),
  controller.update
);

// DELETE /products/:productId/skus/:skuId — Delete a SKU
router.delete('/:skuId',
  authenticateToken, requireRole('seller', 'admin'),
  validateParams(skuParamsSchema),
  controller.remove
);

module.exports = router;
