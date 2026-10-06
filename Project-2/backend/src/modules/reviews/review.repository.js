const { query } = require('../../config/database');

/**
 * Review Repository — Product Reviews
 */

async function createProductReview({ productId, userId, rating, text }) {
  const sql = `
    INSERT INTO reviews (product_id, user_id, rating, text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const res = await query(sql, [productId, userId, rating, text || null]);
  return res.rows[0];
}

async function findProductReviewById(id) {
  const sql = `
    SELECT r.*, u.name AS user_name, u.email AS user_email
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function findProductReviewsByProductId(productId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const countSql = `SELECT COUNT(*)::int AS total FROM reviews WHERE product_id = $1;`;
  const countRes = await query(countSql, [productId]);
  const total = countRes.rows[0]?.total || 0;

  const sql = `
    SELECT r.*, u.name AS user_name, u.email AS user_email
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const res = await query(sql, [productId, limit, offset]);
  return { reviews: res.rows, total };
}

async function findProductReviewByUserAndProduct(userId, productId) {
  const sql = `
    SELECT * FROM reviews
    WHERE user_id = $1 AND product_id = $2
    LIMIT 1;
  `;
  const res = await query(sql, [userId, productId]);
  return res.rows[0] || null;
}

async function updateProductReview(id, { rating, text }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (rating !== undefined) { fields.push(`rating = $${paramIndex}`); values.push(rating); paramIndex++; }
  if (text !== undefined) { fields.push(`text = $${paramIndex}`); values.push(text); paramIndex++; }

  if (fields.length === 0) return findProductReviewById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;
  const res = await query(sql, values);
  return res.rows[0] || null;
}

async function deleteProductReview(id) {
  await query(`DELETE FROM reviews WHERE id = $1;`, [id]);
}

async function getProductReviewStats(productId) {
  const sql = `
    SELECT COUNT(*)::int AS review_count, COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating
    FROM reviews WHERE product_id = $1;
  `;
  const res = await query(sql, [productId]);
  return res.rows[0] || { review_count: 0, avg_rating: 0 };
}

/**
 * Review Repository — Store Reviews
 */

async function createStoreReview({ storeId, userId, rating, text }) {
  const sql = `
    INSERT INTO store_reviews (store_id, user_id, rating, text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const res = await query(sql, [storeId, userId, rating, text || null]);
  return res.rows[0];
}

async function findStoreReviewById(id) {
  const sql = `
    SELECT sr.*, u.name AS user_name, u.email AS user_email
    FROM store_reviews sr
    LEFT JOIN users u ON sr.user_id = u.id
    WHERE sr.id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function findStoreReviewsByStoreId(storeId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const countSql = `SELECT COUNT(*)::int AS total FROM store_reviews WHERE store_id = $1;`;
  const countRes = await query(countSql, [storeId]);
  const total = countRes.rows[0]?.total || 0;

  const sql = `
    SELECT sr.*, u.name AS user_name, u.email AS user_email
    FROM store_reviews sr
    LEFT JOIN users u ON sr.user_id = u.id
    WHERE sr.store_id = $1
    ORDER BY sr.created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const res = await query(sql, [storeId, limit, offset]);
  return { reviews: res.rows, total };
}

async function findStoreReviewByUserAndStore(userId, storeId) {
  const sql = `
    SELECT * FROM store_reviews
    WHERE user_id = $1 AND store_id = $2
    LIMIT 1;
  `;
  const res = await query(sql, [userId, storeId]);
  return res.rows[0] || null;
}

async function updateStoreReview(id, { rating, text }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (rating !== undefined) { fields.push(`rating = $${paramIndex}`); values.push(rating); paramIndex++; }
  if (text !== undefined) { fields.push(`text = $${paramIndex}`); values.push(text); paramIndex++; }

  if (fields.length === 0) return findStoreReviewById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `UPDATE store_reviews SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;
  const res = await query(sql, values);
  return res.rows[0] || null;
}

async function deleteStoreReview(id) {
  await query(`DELETE FROM store_reviews WHERE id = $1;`, [id]);
}

async function getStoreReviewStats(storeId) {
  const sql = `
    SELECT COUNT(*)::int AS review_count, COALESCE(AVG(rating), 0)::numeric(3,2) AS avg_rating
    FROM store_reviews WHERE store_id = $1;
  `;
  const res = await query(sql, [storeId]);
  return res.rows[0] || { review_count: 0, avg_rating: 0 };
}

/**
 * Unified Review Lookup
 */

async function findReviewById(id) {
  // Check product reviews first
  const productReview = await findProductReviewById(id);
  if (productReview) return { type: 'product', review: productReview };

  // Check store reviews
  const storeReview = await findStoreReviewById(id);
  if (storeReview) return { type: 'store', review: storeReview };

  return null;
}

module.exports = {
  createProductReview,
  findProductReviewById,
  findReviewById,
  findProductReviewsByProductId,
  findProductReviewByUserAndProduct,
  updateProductReview,
  deleteProductReview,
  getProductReviewStats,
  createStoreReview,
  findStoreReviewById,
  findStoreReviewsByStoreId,
  findStoreReviewByUserAndStore,
  updateStoreReview,
  deleteStoreReview,
  getStoreReviewStats,
};
