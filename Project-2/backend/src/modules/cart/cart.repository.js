const db = require('../../config/database');

const CART_TABLE = 'cart_items';

/**
 * Find a cart item by its ID, scoped to a user.
 */
const findById = async (itemId, userId) => {
  return db(CART_TABLE)
    .where({ id: itemId, user_id: userId })
    .first();
};

/**
 * Find a cart item by SKU ID for a specific user.
 */
const findByUserAndSku = async (userId, skuId) => {
  return db(CART_TABLE)
    .where({ user_id: userId, sku_id: skuId })
    .first();
};

/**
 * Get all cart items for a user with full product/SKU/store details.
 * Joins: cart_items -> product_skus -> products -> stores
 */
const findByUserId = async (userId) => {
  return db(CART_TABLE)
    .join('product_skus', 'cart_items.sku_id', 'product_skus.id')
    .join('products', 'product_skus.product_id', 'products.id')
    .join('stores', 'products.store_id', 'stores.id')
    .where('cart_items.user_id', userId)
    .select(
      'cart_items.id',
      'cart_items.sku_id',
      'cart_items.quantity',
      'cart_items.created_at',
      'cart_items.updated_at',
      'product_skus.sku_code',
      'product_skus.price_override',
      'product_skus.status as sku_status',
      'product_skus.stock_quantity',
      'products.id as product_id',
      'products.title as product_title',
      'products.price as product_price',
      'products.status as product_status',
      'stores.id as store_id',
      'stores.name as store_name',
      'stores.slug as store_slug'
    )
    .orderBy('cart_items.created_at', 'asc');
};

/**
 * Upsert a cart item: insert if new, update quantity if exists.
 * Uses the UNIQUE(user_id, sku_id) constraint.
 */
const upsert = async (userId, skuId, quantity) => {
  const existing = await findByUserAndSku(userId, skuId);
  if (existing) {
    const [updated] = await db(CART_TABLE)
      .where({ id: existing.id })
      .update({ quantity, updated_at: db.fn.now() })
      .returning('*');
    return { item: updated, isUpdate: true };
  }
  const [created] = await db(CART_TABLE)
    .insert({ user_id: userId, sku_id: skuId, quantity })
    .returning('*');
  return { item: created, isUpdate: false };
};

/**
 * Update quantity for a specific cart item.
 */
const updateQuantity = async (itemId, userId, quantity) => {
  const [updated] = await db(CART_TABLE)
    .where({ id: itemId, user_id: userId })
    .update({ quantity, updated_at: db.fn.now() })
    .returning('*');
  return updated || null;
};

/**
 * Remove a single cart item.
 */
const removeItem = async (itemId, userId) => {
  const deleted = await db(CART_TABLE)
    .where({ id: itemId, user_id: userId })
    .del();
  return deleted > 0;
};

/**
 * Clear all cart items for a user.
 */
const clearCart = async (userId) => {
  const deleted = await db(CART_TABLE)
    .where({ user_id: userId })
    .del();
  return deleted;
};

/**
 * Get the total number of items (sum of quantities) in a user's cart.
 */
const getItemCount = async (userId) => {
  const result = await db(CART_TABLE)
    .where({ user_id: userId })
    .sum('quantity as total');
  return Number(result[0].total) || 0;
};

module.exports = {
  findById,
  findByUserAndSku,
  findByUserId,
  upsert,
  updateQuantity,
  removeItem,
  clearCart,
  getItemCount,
};
