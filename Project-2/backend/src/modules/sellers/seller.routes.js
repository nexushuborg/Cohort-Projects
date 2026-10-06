const express = require('express');
const sellerController = require('./seller.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const {
  registerStoreSchema,
  updateStoreSchema,
  updateStoreStatusSchema,
  storeQuerySchema,
} = require('./seller.validation');

const router = express.Router();

// Public routes
router.get('/stores', validate(storeQuerySchema), sellerController.getStores);
router.get('/stores/:slug', sellerController.getStoreBySlug);

// Protected routes (Buyer / Seller)
router.post('/register-store', authMiddleware, validate(registerStoreSchema), sellerController.registerStore);
router.get('/stores/me/profile', authMiddleware, requireRole('seller', 'admin'), sellerController.getMyStore);
router.put('/stores/:id', authMiddleware, validate(updateStoreSchema), sellerController.updateStore);

// Admin-only store status route
router.patch('/stores/:id/status', authMiddleware, requireRole('admin'), validate(updateStoreStatusSchema), sellerController.updateStoreStatus);

module.exports = router;
