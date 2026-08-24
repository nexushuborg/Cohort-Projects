const { Pool } = require('pg');
const env = require('./env');

const isTest = env.NODE_ENV === 'test';

const pool = new Pool(
  isTest
    ? { connectionString: env.TEST_DATABASE_URL }
    : env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'marketplace',
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Helper for running simple parameterized queries
async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
