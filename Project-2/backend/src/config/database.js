const knex = require('knex');
const { Pool } = require('pg');
const env = require('./env');

// ─── Knex Instance (Person 2 repositories) ───────────────────
let knexConfig;
try {
  knexConfig = require('../../knexfile');
} catch (e) {
  knexConfig = {};
}

const isTest = env.NODE_ENV === 'test';
const nodeEnv = env.nodeEnv || env.NODE_ENV || 'development';

// Build pg Pool config from DB_* env vars — same source as setup-db.js
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '272006',
  database: isTest
    ? (process.env.DB_NAME ? process.env.DB_NAME + '_test' : 'marketplace_test')
    : (process.env.DB_NAME || 'marketplace'),
};

// Build connection string for Knex from the same DB_* env vars
const connectionString = `postgres://${poolConfig.user}:${poolConfig.password}@${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`;

const dbConfig = knexConfig[nodeEnv] || {
  client: 'pg',
  connection: connectionString,
  migrations: {
    directory: './src/migrations',
  },
};

const db = knex(dbConfig);

// ─── pg Pool (Person 1 repositories + migrate.js) ────────────
const pool = new Pool(poolConfig);

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
