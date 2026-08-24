const { v4: uuidv4 } = require('uuid');

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
  user: { sub: generateId(), email: 'test@test.com', role: 'seller' },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

module.exports = {
  generateId,
  mockReq,
  mockRes,
  mockNext,
};
