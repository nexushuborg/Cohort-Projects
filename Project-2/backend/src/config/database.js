const knex = require('knex');
const { Pool } = require('pg');
const knexConfig = require('../../knexfile');
const env = require('./env');

const isTest = env.nodeEnv === 'test' || env.NODE_ENV === 'test';
const dbConfig = knexConfig[env.nodeEnv || env.NODE_ENV || 'development'];
const db = knex(dbConfig);

const connectionString = isTest
  ? (env.testDatabaseUrl || env.TEST_DATABASE_URL || env.databaseUrl || env.DATABASE_URL)
  : (env.databaseUrl || env.DATABASE_URL);

const pool = new Pool(
  connectionString
    ? { connectionString }
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

async function query(text, params) {
  return pool.query(text, params);
}

db.pool = pool;
db.query = query;

module.exports = db;
module.exports.pool = pool;
module.exports.query = query;
module.exports.db = db;
