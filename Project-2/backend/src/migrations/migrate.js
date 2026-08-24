const fs = require('fs');
const path = require('path');
const { query, pool } = require('../config/database');

async function runMigrations() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Running pure SQL migrations...');
    await query(schemaSql);
    console.log('✅ All 16 tables and indexes created successfully via SQL query.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = {
  runMigrations,
};
