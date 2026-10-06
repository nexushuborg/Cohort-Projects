const db = require('../../config/database');

const TABLE = 'product_images';

/**
 * Create a new product image
 */
const create = async (imageData) => {
  const [image] = await db(TABLE)
    .insert(imageData)
    .returning('*');
  return image;
};

/**
 * Find image by ID
 */
const findById = async (id) => {
  return db(TABLE).where({ id }).first();
};

/**
 * Find all images for a product, ordered by sort_order
 */
const findByProductId = async (productId) => {
  return db(TABLE)
    .where({ product_id: productId })
    .orderBy('sort_order', 'asc')
    .orderBy('created_at', 'asc');
};

/**
 * Get the maximum sort_order for a product's images
 */
const getMaxSortOrder = async (productId) => {
  const result = await db(TABLE)
    .where({ product_id: productId })
    .max('sort_order as max_sort')
    .first();
  return result ? (result.max_sort ?? -1) : -1;
};

/**
 * Count images for a product
 */
const countByProductId = async (productId) => {
  const result = await db(TABLE)
    .where({ product_id: productId })
    .count('* as count')
    .first();
  return Number(result.count);
};

/**
 * Update an image by ID
 */
const update = async (id, updateData) => {
  const [image] = await db(TABLE)
    .where({ id })
    .update(updateData)
    .returning('*');
  return image;
};

/**
 * Delete an image by ID
 */
const remove = async (id) => {
  const deleted = await db(TABLE).where({ id }).del();
  return deleted > 0;
};

/**
 * Bulk update sort_orders for a product's images (for primary image swap)
 */
const bulkUpdateSortOrder = async (updates) => {
  // updates: [{ id, sort_order }, ...]
  return db.transaction(async (trx) => {
    for (const { id, sort_order } of updates) {
      await trx(TABLE).where({ id }).update({ sort_order });
    }
  });
};

module.exports = {
  create,
  findById,
  findByProductId,
  getMaxSortOrder,
  countByProductId,
  update,
  remove,
  bulkUpdateSortOrder,
};
