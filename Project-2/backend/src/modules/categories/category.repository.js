const { query } = require('../../config/database');

/**
 * Category Repository (Pure SQL Query Functions)
 */

async function findAllCategories() {
  const sql = `
    SELECT * FROM categories
    ORDER BY name ASC;
  `;
  const res = await query(sql);
  return res.rows;
}

async function findCategoryById(id) {
  const sql = `
    SELECT * FROM categories
    WHERE id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function findCategoryBySlug(slug) {
  const sql = `
    SELECT * FROM categories
    WHERE LOWER(slug) = LOWER($1)
    LIMIT 1;
  `;
  const res = await query(sql, [slug]);
  return res.rows[0] || null;
}

async function createCategory(categoryData) {
  const sql = `
    INSERT INTO categories (name, slug, parent_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [
    categoryData.name,
    categoryData.slug.toLowerCase(),
    categoryData.parent_id || null,
  ];
  const res = await query(sql, values);
  return res.rows[0];
}

async function updateCategory(id, updateData) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`"${key}" = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  if (fields.length === 0) {
    return findCategoryById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE categories
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  const res = await query(sql, values);
  return res.rows[0] || null;
}

async function deleteCategory(id) {
  const sql = `
    DELETE FROM categories
    WHERE id = $1;
  `;
  await query(sql, [id]);
}

async function countChildCategories(parentId) {
  const sql = `
    SELECT COUNT(id)::int AS count
    FROM categories
    WHERE parent_id = $1;
  `;
  const res = await query(sql, [parentId]);
  return res.rows[0]?.count || 0;
}

async function countAssociatedProducts(categoryId) {
  const sql = `
    SELECT COUNT(id)::int AS count
    FROM products
    WHERE category_id = $1;
  `;
  const res = await query(sql, [categoryId]);
  return res.rows[0]?.count || 0;
}

module.exports = {
  findAllCategories,
  findCategoryById,
  findCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  countChildCategories,
  countAssociatedProducts,
};
