const db = require('../models/connection');

const createTables = async () => {
  const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

    CREATE TABLE IF NOT EXISTS venue_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS venue_rows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      section_id UUID REFERENCES venue_sections(id) ON DELETE CASCADE,
      label VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    

    CREATE TABLE IF NOT EXISTS venue_seats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
      seat_number VARCHAR(50) NOT NULL,
      section VARCHAR(100),
      UNIQUE(venue_id, seat_number)
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

    -- 5. Bookings
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) NOT NULL,
      event_id UUID REFERENCES events(id) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 6. Booking Items (one row per ticket-tier line in a booking)
    CREATE TABLE IF NOT EXISTS booking_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      ticket_tier_id UUID REFERENCES ticket_tiers(id) NOT NULL,
      seat_id UUID REFERENCES venue_seats(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      price_at_purchase DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 7. Payments
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID REFERENCES bookings(id) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      method VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      transaction_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- 8. Tickets
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_item_id UUID REFERENCES booking_items(id) NOT NULL,
      qr_code VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
      checked_in_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Seat Holds (temporary reservation)
    CREATE TABLE IF NOT EXISTS seat_holds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seat_id UUID REFERENCES venue_seats(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES events(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      text TEXT,
      organizer_response TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(event_id, user_id)
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