const express = require('express');
const router = express.Router();
const controller = require('./order.controller');
const { validate, validateParams, validateQuery } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const {
  checkoutSchema,
  orderIdSchema,
  orderQuerySchema,
} = require('./order.validation');

// All order routes require authentication and buyer role
router.use(authenticateToken);
router.use(requireRole('buyer'));

// POST /orders/checkout — Create order from cart
router.post('/checkout',
  validate(checkoutSchema),
  controller.checkout
);

// GET /orders/me — List buyer's orders
router.get('/me',
  validateQuery(orderQuerySchema),
  controller.getMyOrders
);

// GET /orders/:id — Get single order
router.get('/:id',
  validateParams(orderIdSchema),
  controller.getOrderById
);

// POST /orders/:id/cancel — Cancel order
router.post('/:id/cancel',
  validateParams(orderIdSchema),
  controller.cancelOrder
);

module.exports = router;
