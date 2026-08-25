/**
 * Order View (Serialization & Response Presentation)
 */

function formatOrderSummary(order) {
  if (!order) return null;
  return {
    id: order.id,
    totalAmount: Number(order.total_amount),
    shippingAddress: order.shipping_address,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

function formatSellerOrder(so) {
  if (!so) return null;
  return {
    id: so.id,
    storeId: so.store_id,
    subtotal: Number(so.subtotal),
    status: so.status,
    items: so.items ? so.items.map(formatOrderItem) : [],
    createdAt: so.created_at,
    updatedAt: so.updated_at,
  };
}

function formatOrderItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    skuId: item.sku_id,
    quantity: item.quantity,
    priceAtPurchase: Number(item.price_at_purchase),
    createdAt: item.created_at,
  };
}

function formatOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    buyerId: order.buyer_id,
    totalAmount: Number(order.total_amount),
    shippingAddress: order.shipping_address,
    status: order.status,
    sellerOrders: order.sellerOrders
      ? order.sellerOrders.map(formatSellerOrder)
      : [],
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

module.exports = {
  formatOrderSummary,
  formatSellerOrder,
  formatOrderItem,
  formatOrder,
};
