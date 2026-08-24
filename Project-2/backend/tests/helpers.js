const { v4: uuidv4 } = require('uuid');
const { query } = require('../src/config/database');
const authService = require('../src/modules/auth/auth.service');

/**
 * Generate a valid UUID for testing
 */
const generateId = () => uuidv4();

/**
 * Create a mock Express req/res/next for unit testing controllers
 */
const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { sub: generateId(), id: generateId(), email: 'test@test.com', role: 'seller' },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

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
  generateId,
  mockReq,
  mockRes,
  mockNext,
  cleanDatabase,
  createTestUser,
  query,
};
