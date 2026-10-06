const orderService = require('./order.service');
const orderView = require('./order.view');

/**
 * POST /orders/checkout
 * Create an order from the buyer's cart.
 */
const checkout = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const order = await orderService.checkout(req.user.id, shippingAddress);
    return res.status(201).json({
      success: true,
      data: orderView.formatOrder(order),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /orders/me
 * List all orders for the authenticated buyer.
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await orderService.getOrdersByBuyerId(req.user.id, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return res.status(200).json({
      success: true,
      data: {
        items: result.items.map(orderView.formatOrderSummary),
        pagination: result.pagination,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /orders/:id
 * Get a single order by ID (buyer only).
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: orderView.formatOrder(order),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /orders/:id/cancel
 * Cancel an order (buyer only, only if status is 'placed').
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: orderView.formatOrder(order),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
