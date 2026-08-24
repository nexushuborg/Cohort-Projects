// PostgreSQL connection from explicit DB_* env variables only.
// Same source as setup-db.js — no DATABASE_URL dependency.
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || '272006';

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host,
      port: parseInt(port, 10),
      user,
      password,
      database: process.env.DB_NAME || 'marketplace',
    },
    migrations: { directory: './src/migrations' },
    seeds: { directory: './src/seeds' },
  },
  test: {
    client: 'pg',
    connection: {
      host,
      port: parseInt(port, 10),
      user,
      password,
      database: process.env.DB_NAME ? process.env.DB_NAME + '_test' : 'marketplace_test',
    },
    migrations: { directory: './src/migrations' },
    seeds: { directory: './src/seeds' },
  },
  production: {
    client: 'pg',
    connection: {
      host,
      port: parseInt(port, 10),
      user,
      password,
      database: process.env.DB_NAME || 'marketplace',
    },
    migrations: { directory: './src/migrations' },
    seeds: { directory: './src/seeds' },
  },
};
