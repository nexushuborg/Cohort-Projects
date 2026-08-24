const { runMigrations } = require('../src/migrations/migrate');
const { pool } = require('../src/config/database');

beforeAll(async () => {
  try {
    await runMigrations();
  } catch (err) {
    console.error('Migration setup failed in test suite:', err.message);
  }
});

afterAll(async () => {
  await pool.end();
});
