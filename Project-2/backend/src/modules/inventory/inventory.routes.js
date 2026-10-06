const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('./inventory.controller');
const { validate, validateParams } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const { productParamsSchema, inventoryParamsSchema, setStockSchema, adjustStockSchema } = require('./inventory.validation');

// GET /products/:productId/inventory — List inventory for all SKUs
router.get('/',
  authenticateToken,
  requireRole('seller', 'admin'),
  validateParams(productParamsSchema),
  controller.list
);

// GET /products/:productId/inventory/:skuId — Get inventory for a specific SKU
router.get('/:skuId',
  authenticateToken,
  requireRole('seller', 'admin'),
  validateParams(inventoryParamsSchema),
  controller.getOne
);

// PUT /products/:productId/inventory/:skuId — Set stock to absolute value
router.put('/:skuId',
  authenticateToken,
  requireRole('seller', 'admin'),
  validateParams(inventoryParamsSchema),
  validate(setStockSchema),
  controller.setStock
);

// PATCH /products/:productId/inventory/:skuId — Adjust stock by relative delta
router.patch('/:skuId',
  authenticateToken,
  requireRole('seller', 'admin'),
  validateParams(inventoryParamsSchema),
  validate(adjustStockSchema),
  controller.adjustStock
);

module.exports = router;
