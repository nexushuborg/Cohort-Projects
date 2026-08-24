const db = require('../models/connection');

const createTables = async () => {
  const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    --1. Users Table 
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'attendee',
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 2. Venues Table 
    CREATE TABLE IF NOT EXISTS venues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100),
      country VARCHAR(100) NOT NULL,
      zip_code VARCHAR(20),
      capacity INTEGER NOT NULL,
      created_by UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    --3. Events Table
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
      organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      banner_url TEXT,
      event_date TIMESTAMP NOT NULL,
      event_end_date TIMESTAMP,
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

   -- 4. Ticket Tiers Table
    CREATE TABLE IF NOT EXISTS ticket_tiers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES events(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      total_quantity INTEGER NOT NULL,
      sold_quantity INTEGER DEFAULT 0,
      sale_start TIMESTAMP,
      sale_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await db.query(queryText);
    console.log('Database tables successfully synchronized.');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
};

module.exports = createTables;