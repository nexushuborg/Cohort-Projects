const db = require('../src/config/database');

// Clean up test database before each test suite
afterAll(async () => {
  await db.destroy();
});
