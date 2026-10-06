const db = require('../../config/database');

const findUserByEmail = async (email) => {
  return db('users').where({ email }).first();
};

const findUserById = async (id) => {
  return db('users')
    .select('id', 'email', 'name', 'phone', 'avatar_url', 'created_at')
    .where({ id })
    .first();
};

const createUser = async (userData) => {
  const [user] = await db('users')
    .insert(userData)
    .returning(['id', 'email', 'name', 'phone', 'avatar_url', 'created_at']);
  return user;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};