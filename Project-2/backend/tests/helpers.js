const { query } = require('../src/config/database');
const authService = require('../src/modules/auth/auth.service');

async function cleanDatabase() {
  await query('TRUNCATE TABLE users, stores, categories CASCADE;');
}

async function createTestUser({ email, password = 'Password123!', name, role = 'buyer' }) {
  return authService.register({
    email,
    password,
    name,
    role,
  });
}

module.exports = {
  cleanDatabase,
  createTestUser,
  query,
};
