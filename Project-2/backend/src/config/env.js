require('dotenv').config();

const env = {
  // Port
  port: parseInt(process.env.PORT || '5000', 10),
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace',

  testDatabaseUrl: process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace_test',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace_test',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-prod-12345',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-prod-12345',

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-67890',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-67890',

  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',

  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),

  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '500', 10),
};

module.exports = env;
