const { runMigrations } = require('../src/migrations/migrate');
const db = require('../src/config/database');

beforeAll(async () => {
  try {
    await runMigrations();
  } catch (err) {
    console.error('Migration setup failed in test suite:', err.message);
  }
});

afterAll(async () => {
  if (db && typeof db.destroy === 'function') {
    try {
      await db.destroy();
    } catch (e) {}
  }
  if (db && db.pool && typeof db.pool.end === 'function') {
    try {
      await db.pool.end();
    } catch (e) {}
  }
});
