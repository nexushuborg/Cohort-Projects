const db = require('../../config/database');

const ORDERS_TABLE = 'orders';
const SELLER_ORDERS_TABLE = 'seller_orders';
const ORDER_ITEMS_TABLE = 'order_items';
const CART_TABLE = 'cart_items';
const SKU_TABLE = 'product_skus';

/**
 * Create a complete order within a transaction.
 * Creates: parent order → seller orders → order items → inventory decrements → cart clear
 * Returns the created parent order with all nested data.
 */
const createOrder = async (buyerId, shippingAddress, cartRows) => {
  return db.transaction(async (trx) => {
    // 1. Group cart items by store_id
    const storeMap = {};
    for (const row of cartRows) {
      const storeId = row.store_id;
      if (!storeMap[storeId]) {
        storeMap[storeId] = { storeId, items: [], subtotal: 0 };
      }
      storeMap[storeId].items.push(row);
      const price = row.price_override !== null && row.price_override !== undefined
        ? Number(row.price_override)
        : Number(row.product_price);
      storeMap[storeId].subtotal = Number((storeMap[storeId].subtotal + price * row.quantity).toFixed(2));
    }

    // 2. Calculate total amount
    const totalAmount = Number(
      Object.values(storeMap).reduce((sum, group) => sum + group.subtotal, 0).toFixed(2)
    );

    // 3. Create parent order
    const [parentOrder] = await trx(ORDERS_TABLE)
      .insert({
        buyer_id: buyerId,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'placed',
      })
      .returning('*');

    // 4. Create seller orders and order items for each store group
    const sellerOrders = [];
    for (const group of Object.values(storeMap)) {
      const [sellerOrder] = await trx(SELLER_ORDERS_TABLE)
        .insert({
          parent_order_id: parentOrder.id,
          store_id: group.storeId,
          subtotal: group.subtotal,
          status: 'pending',
        })
        .returning('*');

      const orderItems = [];
      for (const item of group.items) {
        const price = item.price_override !== null && item.price_override !== undefined
          ? Number(item.price_override)
          : Number(item.product_price);

        const [orderItem] = await trx(ORDER_ITEMS_TABLE)
          .insert({
            seller_order_id: sellerOrder.id,
            sku_id: item.sku_id,
            quantity: item.quantity,
            price_at_purchase: price,
          })
          .returning('*');

        orderItems.push(orderItem);

        // 5. Decrement inventory atomically
        const updated = await trx(SKU_TABLE)
          .where('id', item.sku_id)
          .where('stock_quantity', '>=', item.quantity)
          .update({
            stock_quantity: db.raw('stock_quantity - ?', [item.quantity]),
            updated_at: trx.fn.now(),
          });

        if (updated === 0) {
          throw Object.assign(new Error('Insufficient stock for one or more items'), {
            status: 400,
            code: 'VALIDATION_ERROR',
          });
        }
      }

      sellerOrders.push({ ...sellerOrder, items: orderItems });
    }

    // 6. Clear the buyer's cart
    await trx(CART_TABLE).where({ user_id: buyerId }).del();

    return { ...parentOrder, sellerOrders };
  });
};

/**
 * Find a parent order by ID, scoped to a buyer.
 */
const findOrderById = async (orderId, buyerId) => {
  return db(ORDERS_TABLE)
    .where({ id: orderId, buyer_id: buyerId })
    .first();
};

/**
 * Find a parent order by ID (no buyer scope — for admin).
 */
const findOrderByIdAny = async (orderId) => {
  return db(ORDERS_TABLE).where({ id: orderId }).first();
};

/**
 * Get all orders for a buyer with pagination.
 */
const findOrdersByBuyerId = async (buyerId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  const countResult = await db(ORDERS_TABLE)
    .where({ buyer_id: buyerId })
    .count('* as total')
    .first();

  const total = Number(countResult.total);

  const items = await db(ORDERS_TABLE)
    .where({ buyer_id: buyerId })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get seller orders (child orders) for a parent order.
 */
const findSellerOrdersByParentId = async (parentOrderId) => {
  return db(SELLER_ORDERS_TABLE)
    .where({ parent_order_id: parentOrderId })
    .orderBy('created_at', 'asc');
};

/**
 * Get order items for a seller order.
 */
const findOrderItemsBySellerOrderId = async (sellerOrderId) => {
  return db(ORDER_ITEMS_TABLE)
    .where({ seller_order_id: sellerOrderId })
    .orderBy('created_at', 'asc');
};

/**
 * Update parent order status.
 */
const updateOrderStatus = async (orderId, status) => {
  const [updated] = await db(ORDERS_TABLE)
    .where({ id: orderId })
    .update({ status, updated_at: db.fn.now() })
    .returning('*');
  return updated || null;
};

module.exports = {
  createOrder,
  findOrderById,
  findOrderByIdAny,
  findOrdersByBuyerId,
  findSellerOrdersByParentId,
  findOrderItemsBySellerOrderId,
  updateOrderStatus,
};
