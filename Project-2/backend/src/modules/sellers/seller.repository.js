const { query } = require('../../config/database');

/**
 * Seller Repository (Pure SQL Query Functions)
 */

async function findStoreById(id) {
  const sql = `
    SELECT stores.*, users.name as owner_name, users.email as owner_email
    FROM stores
    JOIN users ON stores.owner_id = users.id
    WHERE stores.id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function findStoreBySlug(slug) {
  const sql = `
    SELECT stores.*, users.name as owner_name, users.email as owner_email
    FROM stores
    JOIN users ON stores.owner_id = users.id
    WHERE LOWER(stores.slug) = LOWER($1)
    LIMIT 1;
  `;
  const res = await query(sql, [slug]);
  return res.rows[0] || null;
}

async function findStoreByOwnerId(ownerId) {
  const sql = `
    SELECT stores.*, users.name as owner_name, users.email as owner_email
    FROM stores
    JOIN users ON stores.owner_id = users.id
    WHERE stores.owner_id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [ownerId]);
  return res.rows[0] || null;
}

async function createStore(storeData) {
  const sql = `
    INSERT INTO stores (
      owner_id,
      name,
      slug,
      description,
      logo_url,
      banner_url,
      policies,
      contact_email,
      contact_phone,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    storeData.owner_id,
    storeData.name,
    storeData.slug.toLowerCase(),
    storeData.description || null,
    storeData.logo_url || null,
    storeData.banner_url || null,
    storeData.policies || null,
    storeData.contact_email || null,
    storeData.contact_phone || null,
    storeData.status || 'pending',
  ];

  const res = await query(sql, values);
  return res.rows[0];
}

async function updateStore(id, updateData) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`"${key}" = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  if (fields.length === 0) {
    return findStoreById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE stores
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  const res = await query(sql, values);
  return res.rows[0] || null;
}

async function updateStoreStatus(id, status) {
  const sql = `
    UPDATE stores
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const res = await query(sql, [status, id]);
  return res.rows[0] || null;
}

async function findStores({ page = 1, limit = 20, status = 'active', search = null } = {}) {
  const offset = (page - 1) * limit;
  const whereClauses = [];
  const params = [];

  if (status) {
    params.push(status);
    whereClauses.push(`stores.status = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    whereClauses.push(`(stores.name ILIKE $${params.length} OR stores.description ILIKE $${params.length})`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(stores.id)::int AS total FROM stores ${whereSql}`;
  const countRes = await query(countSql, params);
  const total = countRes.rows[0]?.total || 0;

  const dataSql = `
    SELECT stores.*, users.name as owner_name, users.email as owner_email
    FROM stores
    JOIN users ON stores.owner_id = users.id
    ${whereSql}
    ORDER BY stores.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2};
  `;

  const dataRes = await query(dataSql, [...params, limit, offset]);

  return {
    stores: dataRes.rows,
    total,
  };
}

module.exports = {
  findStoreById,
  findStoreBySlug,
  findStoreByOwnerId,
  createStore,
  updateStore,
  updateStoreStatus,
  findStores,
};
