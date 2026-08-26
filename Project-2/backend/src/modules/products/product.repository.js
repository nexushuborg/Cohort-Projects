const db = require('../../config/database');

const TABLE = 'products';

/**
 * Create a new product
 */
const create = async (productData) => {
  const [product] = await db(TABLE)
    .insert(productData)
    .returning('*');
  return product;
};

/**
 * Find product by ID
 */
const findById = async (id) => {
  return db(TABLE).where({ id }).first();
};

/**
 * Find product by slug
 */
const findBySlug = async (slug) => {
  return db(TABLE).where({ slug }).first();
};

/**
 * Find all products with optional filters and pagination
 */
const findAll = async ({ page = 1, limit = 20, status, storeId, categoryId } = {}) => {
  let query = db(TABLE).select('*');

  if (status) {
    query = query.where('status', status);
  }
  if (storeId) {
    query = query.where('store_id', storeId);
  }
  if (categoryId) {
    query = query.where('category_id', categoryId);
  }

  const offset = (page - 1) * limit;
  const items = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);
  const countResult = await db(TABLE)
    .count('* as total')
    .modify((qb) => {
      if (status) qb.where('status', status);
      if (storeId) qb.where('store_id', storeId);
      if (categoryId) qb.where('category_id', categoryId);
    })
    .first();
  const total = Number(countResult.total);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
};

/**
 * Find products by store ID
 */
const findByStoreId = async (storeId, { page = 1, limit = 20 } = {}) => {
  let query = db(TABLE).where('store_id', storeId).select('*');

  const offset = (page - 1) * limit;
  const items = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);
  const countResult = await db(TABLE).where('store_id', storeId).count('* as total').first();
  const total = Number(countResult.total);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
};

/**
 * Update a product by ID
 */
const update = async (id, updateData) => {
  const [product] = await db(TABLE)
    .where({ id })
    .update({ ...updateData, updated_at: db.fn.now() })
    .returning('*');
  return product;
};

/**
 * Delete a product by ID
 */
const remove = async (id) => {
  const deleted = await db(TABLE).where({ id }).del();
  return deleted > 0;
};

/**
 * Check if slug exists (optionally excluding a product ID)
 */
const slugExists = async (slug, excludeId = null) => {
  let query = db(TABLE).where({ slug }).first();
  if (excludeId) {
    query = db(TABLE).where({ slug }).whereNot({ id: excludeId }).first();
  }
  const result = await query;
  return !!result;
};

module.exports = {
  create,
  findById,
  findBySlug,
  findAll,
  findByStoreId,
  update,
  remove,
  slugExists,
};
