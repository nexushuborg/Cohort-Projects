process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

beforeAll(() => {
  // Test setup initialization
});

afterAll(() => {
  // Test cleanup
});
