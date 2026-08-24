const { Client } = require('pg');
require('dotenv').config();

async function createDatabaseIfNotExists() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // default administrative database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL root server');

    const dbs = ['marketplace', 'marketplace_test'];

    for (const dbName of dbs) {
      const checkRes = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );

      if (checkRes.rowCount === 0) {
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Created database: ${dbName}`);
      } else {
        console.log(`Database already exists: ${dbName}`);
      }
    }
  } catch (err) {
    console.error('Database setup error:', err.message);
  } finally {
    await client.end();
  }
}

createDatabaseIfNotExists();
