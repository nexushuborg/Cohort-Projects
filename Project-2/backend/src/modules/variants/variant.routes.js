const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('./variant.controller');
const validate = require('../../middleware/validate.middleware');
const { validateParams } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const {
  productParamsSchema,
  variantTypeParamsSchema,
  variantOptionParamsSchema,
  createVariantTypeSchema,
  updateVariantTypeSchema,
  createVariantOptionSchema,
  updateVariantOptionSchema,
} = require('./variant.validation');

// ─── Variant Types ─────────────────────────────────────────────

// GET /products/:productId/variants — List all variant types for a product
router.get('/',
  validateParams(productParamsSchema),
  controller.getTypesByProductId
);

// GET /products/:productId/variants/:variantTypeId — Get variant type with options
router.get('/:variantTypeId',
  validateParams(variantTypeParamsSchema),
  controller.getTypeById
);

// POST /products/:productId/variants — Create a variant type
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.post('/', authenticateToken, requireRole('seller'), validateParams(productParamsSchema), validate(createVariantTypeSchema), controller.createType);
router.post('/',
  validateParams(productParamsSchema),
  validate(createVariantTypeSchema),
  controller.createType
);

// PUT /products/:productId/variants/:variantTypeId — Update a variant type
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.put('/:variantTypeId', authenticateToken, requireRole('seller'), validateParams(variantTypeParamsSchema), validate(updateVariantTypeSchema), controller.updateType);
router.put('/:variantTypeId',
  validateParams(variantTypeParamsSchema),
  validate(updateVariantTypeSchema),
  controller.updateType
);

// DELETE /products/:productId/variants/:variantTypeId — Delete a variant type
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.delete('/:variantTypeId', authenticateToken, requireRole('seller'), validateParams(variantTypeParamsSchema), controller.deleteType);
router.delete('/:variantTypeId',
  validateParams(variantTypeParamsSchema),
  controller.deleteType
);

// ─── Variant Options ───────────────────────────────────────────

// POST /products/:productId/variants/:variantTypeId/options — Create an option
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.post('/:variantTypeId/options', authenticateToken, requireRole('seller'), validateParams(variantTypeParamsSchema), validate(createVariantOptionSchema), controller.createOption);
router.post('/:variantTypeId/options',
  validateParams(variantTypeParamsSchema),
  validate(createVariantOptionSchema),
  controller.createOption
);

// PUT /products/:productId/variants/:variantTypeId/options/:optionId — Update an option
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.put('/:variantTypeId/options/:optionId', authenticateToken, requireRole('seller'), validateParams(variantOptionParamsSchema), validate(updateVariantOptionSchema), controller.updateOption);
router.put('/:variantTypeId/options/:optionId',
  validateParams(variantOptionParamsSchema),
  validate(updateVariantOptionSchema),
  controller.updateOption
);

// DELETE /products/:productId/variants/:variantTypeId/options/:optionId — Delete an option
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.delete('/:variantTypeId/options/:optionId', authenticateToken, requireRole('seller'), validateParams(variantOptionParamsSchema), controller.deleteOption);
router.delete('/:variantTypeId/options/:optionId',
  validateParams(variantOptionParamsSchema),
  controller.deleteOption
);

module.exports = router;
