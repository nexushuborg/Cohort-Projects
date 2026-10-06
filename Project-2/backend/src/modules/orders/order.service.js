const orderRepo = require('./order.repository');
const cartRepo = require('../cart/cart.repository');
const skuRepo = require('../skus/sku.repository');
const productRepo = require('../products/product.repository');
const {
  createNotFoundError,
  createValidationError,
  createForbiddenError,
} = require('../../utils/errors');

/**
 * Checkout: create an order from the buyer's cart.
 *
 * Flow:
 *   1. Fetch cart rows (with joins to SKU, product, store)
 *   2. Validate every SKU and product
 *   3. Verify inventory for every item
 *   4. Run transaction: create order, seller orders, order items, decrement stock, clear cart
 *   5. Return the complete order
 */
const checkout = async (buyerId, shippingAddress) => {
  // 1. Fetch full cart rows (already joined to SKU/product/store)
  const cartRows = await cartRepo.findByUserId(buyerId);
  if (!cartRows || cartRows.length === 0) {
    throw createValidationError('Cart is empty');
  }

  // 2. Validate every SKU and product
  for (const row of cartRows) {
    const sku = await skuRepo.findSkuById(row.sku_id);
    if (!sku) {
      throw createNotFoundError(`SKU not found: ${row.sku_id}`);
    }
    if (sku.status !== 'active') {
      throw createValidationError('One or more items in your cart are no longer available');
    }

    const product = await productRepo.findById(row.product_id);
    if (!product) {
      throw createNotFoundError(`Product not found: ${row.product_id}`);
    }
    if (product.status !== 'active') {
      throw createValidationError('One or more products in your cart are no longer available');
    }

    // 3. Verify inventory
    if (sku.stock_quantity < row.quantity) {
      throw createValidationError(
        `Insufficient stock for "${product.title}" (requested ${row.quantity}, available ${sku.stock_quantity})`
      );
    }
  }

  // 4. Create order in transaction (includes stock decrement + cart clear)
  const order = await orderRepo.createOrder(buyerId, shippingAddress, cartRows);

  return order;
};

/**
 * Get all orders for a buyer with pagination.
 */
const getOrdersByBuyerId = async (buyerId, pagination) => {
  return orderRepo.findOrdersByBuyerId(buyerId, pagination);
};

/**
 * Get a single order by ID, scoped to buyer.
 * Also loads seller orders and order items.
 */
const getOrderById = async (orderId, buyerId) => {
  const order = await orderRepo.findOrderById(orderId, buyerId);
  if (!order) {
    throw createNotFoundError('Order not found');
  }

  const sellerOrders = await orderRepo.findSellerOrdersByParentId(order.id);
  const sellerOrdersWithItems = [];

  for (const so of sellerOrders) {
    const items = await orderRepo.findOrderItemsBySellerOrderId(so.id);
    sellerOrdersWithItems.push({ ...so, items });
  }

  return { ...order, sellerOrders: sellerOrdersWithItems };
};

/**
 * Cancel an order. Only allowed if status is 'placed'.
 */
const cancelOrder = async (orderId, buyerId) => {
  const order = await orderRepo.findOrderById(orderId, buyerId);
  if (!order) {
    throw createNotFoundError('Order not found');
  }

  if (order.status !== 'placed') {
    throw createValidationError('Only orders with status "placed" can be cancelled');
  }

  const updated = await orderRepo.updateOrderStatus(orderId, 'cancelled');
  return updated;
};

module.exports = {
  checkout,
  getOrdersByBuyerId,
  getOrderById,
  cancelOrder,
};
