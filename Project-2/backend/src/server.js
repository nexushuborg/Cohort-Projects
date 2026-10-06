const app = require('./app');
const env = require('./config/env');
const { query, pool } = require('./config/database');

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 Multi-Vendor Marketplace API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  
  try {
    // Verify DB connectivity with SQL query
    await query('SELECT 1');
    console.log('✅ PostgreSQL database connected successfully via SQL query client');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    process.exit(0);
  });
});
