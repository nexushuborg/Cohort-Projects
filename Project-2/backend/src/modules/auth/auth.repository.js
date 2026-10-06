const { query } = require('../../config/database');

async function findUserByEmail(email) {
  const sql = `
    SELECT * FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
}

async function findUserById(id) {
  const sql = `
    SELECT * FROM users
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function createUser(user) {
  const sql = `
    INSERT INTO users (
      email,
      password_hash,
      name,
      role,
      phone,
      avatar_url,
      refresh_token_hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    user.email.toLowerCase(),
    user.password_hash,
    user.name,
    user.role || 'buyer',
    user.phone || null,
    user.avatar_url || null,
    user.refresh_token_hash || null,
  ];

  const result = await query(sql, values);
  return result.rows[0];
}

async function updateUserRefreshToken(userId, refreshTokenHash) {
  const sql = `
    UPDATE users
    SET refresh_token_hash = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await query(sql, [refreshTokenHash, userId]);
  return result.rows[0];
}

async function clearUserRefreshToken(userId) {
  const sql = `
    UPDATE users
    SET refresh_token_hash = NULL,
        updated_at = NOW()
    WHERE id = $1;
  `;
  await query(sql, [userId]);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserRefreshToken,
  clearUserRefreshToken,
};
