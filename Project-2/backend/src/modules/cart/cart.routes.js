const express = require('express');
const router = express.Router();
const controller = require('./cart.controller');
const { validate, validateParams } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const { addItemSchema, updateItemSchema, cartItemParamsSchema } = require('./cart.validation');

// All cart routes require authentication and buyer role
router.use(authenticateToken);
router.use(requireRole('buyer'));

// DELETE /cart — Clear all items (must be before /:id routes)
router.delete('/', controller.clearCart);

// GET /cart — View cart
router.get('/', controller.getCart);

// POST /cart/items — Add item to cart
router.post('/items',
  validate(addItemSchema),
  controller.addItem
);

// PUT /cart/items/:id — Update item quantity
router.put('/items/:id',
  validateParams(cartItemParamsSchema),
  validate(updateItemSchema),
  controller.updateItem
);

// DELETE /cart/items/:id — Remove a single item
router.delete('/items/:id',
  validateParams(cartItemParamsSchema),
  controller.removeItem
);

module.exports = router;
