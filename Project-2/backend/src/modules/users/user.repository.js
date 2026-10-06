const { query } = require('../../config/database');

/**
 * User Repository (Pure SQL Query Functions)
 */

async function findUserById(id) {
  const sql = `
    SELECT id, email, name, role, phone, avatar_url, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function findUsers({ page = 1, limit = 20, role = null } = {}) {
  const offset = (page - 1) * limit;
  let countSql = 'SELECT COUNT(id)::int AS total FROM users';
  let dataSql = `
    SELECT id, email, name, role, phone, avatar_url, created_at, updated_at
    FROM users
  `;

  const countParams = [];
  const dataParams = [];

  if (role) {
    countSql += ' WHERE role = $1';
    countParams.push(role);

    dataSql += ' WHERE role = $1';
    dataParams.push(role);
  }

  const countRes = await query(countSql, countParams);
  const total = countRes.rows[0]?.total || 0;

  dataSql += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2};`;
  dataParams.push(limit, offset);

  const dataRes = await query(dataSql, dataParams);

  return {
    users: dataRes.rows,
    total,
  };
}

async function updateUser(id, updateData) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`"${key}" = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, name, role, phone, avatar_url, created_at, updated_at;
  `;

  const res = await query(sql, values);
  return res.rows[0] || null;
}

async function updateUserRole(id, role) {
  const sql = `
    UPDATE users
    SET role = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, email, name, role, phone, avatar_url, created_at, updated_at;
  `;
  const res = await query(sql, [role, id]);
  return res.rows[0] || null;
}

module.exports = {
  findUserById,
  findUsers,
  updateUser,
  updateUserRole,
};
