const db = require('../../config/database');
const SKU_TABLE = 'product_skus';

/**
 * Get inventory (stock info) for a specific SKU.
 */
const getInventoryBySkuId = async (skuId) => {
  return db(SKU_TABLE)
    .where({ id: skuId })
    .select('id', 'product_id', 'sku_code', 'stock_quantity', 'status', 'updated_at')
    .first();
};

/**
 * Get inventory for all SKUs belonging to a product.
 */
const getInventoryByProductId = async (productId) => {
  return db(SKU_TABLE)
    .where({ product_id: productId })
    .select('id', 'product_id', 'sku_code', 'stock_quantity', 'status', 'updated_at')
    .orderBy('created_at', 'asc');
};

/**
 * Set stock to an absolute value.
 * Uses atomic WHERE to enforce non-negative at DB level.
 * Returns the updated row or null if constraint would be violated.
 */
const setStock = async (skuId, quantity) => {
  if (quantity < 0) {
    const error = new Error('Stock quantity cannot be negative');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const [sku] = await db(SKU_TABLE)
    .where({ id: skuId })
    .update({ stock_quantity: quantity, updated_at: db.fn.now() })
    .returning('*');
  return sku || null;
};

/**
 * Atomically adjust stock by a delta (positive or negative).
 * Uses a WHERE clause to prevent going below zero.
 * Returns the updated row, or null if insufficient stock.
 */
const adjustStock = async (skuId, delta) => {
  const operator = delta >= 0 ? '+' : '-';
  const absDelta = Math.abs(delta);

  // For reduction, ensure stock doesn't go below zero via WHERE clause
  let query = db(SKU_TABLE).where('id', skuId);
  if (delta < 0) {
    query = query.where('stock_quantity', '>=', absDelta);
  }

  const [sku] = await query
    .update({
      stock_quantity: db.raw(`stock_quantity ${operator} ?`, [absDelta]),
      updated_at: db.fn.now(),
    })
    .returning('*');

  return sku || null;
};

module.exports = {
  getInventoryBySkuId,
  getInventoryByProductId,
  setStock,
  adjustStock,
};
