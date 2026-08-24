const knex = require('knex');
const { Pool } = require('pg');
const env = require('./env');

// ─── Knex Instance (Person 2 repositories) ───────────────────
let knexConfig;
try {
  knexConfig = require('../../knexfile');
} catch (e) {
  // knexfile not yet created; provide inline fallback
  knexConfig = {};
}

const isTest = env.NODE_ENV === 'test';
const nodeEnv = env.nodeEnv || env.NODE_ENV || 'development';

// Build Knex config from environment
const dbConfig = knexConfig[nodeEnv] || {
  client: 'pg',
  connection: isTest
    ? (env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace_test')
    : (env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace'),
  migrations: {
    directory: './src/migrations',
  },
};

const db = knex(dbConfig);

// ─── pg Pool (Person 1 repositories) ─────────────────────────
const connectionString = isTest
  ? env.TEST_DATABASE_URL
  : env.DATABASE_URL
    ? env.DATABASE_URL
    : undefined;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || (isTest ? 'marketplace_test' : 'marketplace'),
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Helper for running simple parameterized queries
async function query(text, params) {
  return pool.query(text, params);
}

// Attach pool and query helpers to db instance
db.pool = pool;
db.query = query;

module.exports = db;
module.exports.pool = pool;
module.exports.query = query;
module.exports.db = db;
