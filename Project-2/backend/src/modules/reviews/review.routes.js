const express = require('express');
const router = express.Router();
const controller = require('./review.controller');
const { validate } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const {
  createProductReviewSchema,
  createStoreReviewSchema,
  reviewIdSchema,
  productIdParamSchema,
  storeIdParamSchema,
  reviewQuerySchema,
} = require('./review.validation');

// ─── Product Reviews ────────────────────────────────────────

// GET /reviews/product/:productId — public
router.get('/product/:productId',
  validate(productIdParamSchema),
  validate(reviewQuerySchema),
  controller.getProductReviews
);

// POST /reviews/product/:productId — authenticated buyer
router.post('/product/:productId',
  authenticateToken,
  validate(createProductReviewSchema),
  controller.createProductReview
);

// ─── Store Reviews ──────────────────────────────────────────

// GET /reviews/store/:storeId — public
router.get('/store/:storeId',
  validate(storeIdParamSchema),
  validate(reviewQuerySchema),
  controller.getStoreReviews
);

// POST /reviews/store/:storeId — authenticated buyer
router.post('/store/:storeId',
  authenticateToken,
  validate(createStoreReviewSchema),
  controller.createStoreReview
);

// ─── Single Review (update/delete) ──────────────────────────

// PUT /reviews/:id — authenticated (author only)
router.put('/:id',
  authenticateToken,
  validate(reviewIdSchema),
  controller.updateReview
);

// DELETE /reviews/:id — authenticated (author or admin)
router.delete('/:id',
  authenticateToken,
  validate(reviewIdSchema),
  controller.deleteReview
);

module.exports = router;
