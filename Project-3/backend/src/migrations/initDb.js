const { query } = require("../config/database.js");

const initDatabase = async () => {
    const createTablesQuery = `
        -- 1. Users Table
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'host', 'guest')),
            phone VARCHAR(20),
            avatar_url TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- 2. Property Types Table
        CREATE TABLE IF NOT EXISTS property_types (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE
        );

        -- 3. Amenities Table
        CREATE TABLE IF NOT EXISTS amenities (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            icon VARCHAR(50)
        );

        -- Seed Default Property Types & Amenities
        INSERT INTO property_types (name) VALUES
            ('Apartment'), ('House'), ('Villa'), ('Cabin'), 
            ('Cottage'), ('Loft'), ('Townhouse'), ('Bungalow')
        ON CONFLICT (name) DO NOTHING;

        INSERT INTO amenities (name) VALUES
            ('WiFi'), ('Pool'), ('Kitchen'), ('Parking'),
            ('Air Conditioning'), ('Heating'), ('Washer'), ('Dryer'),
            ('TV'), ('Hot Tub'), ('Fireplace'), ('Dedicated Workspace'), ('Pet Friendly')
        ON CONFLICT (name) DO NOTHING;

                -- 4. Properties Table
        CREATE TABLE IF NOT EXISTS properties (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            host_id UUID REFERENCES users(id) NOT NULL,
            property_type_id UUID REFERENCES property_types(id),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            address TEXT NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100),
            country VARCHAR(100) NOT NULL,
            zip_code VARCHAR(20),
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            price_per_night DECIMAL(10,2) NOT NULL,
            max_guests INTEGER NOT NULL DEFAULT 1,
            bedrooms INTEGER NOT NULL DEFAULT 1,
            bathrooms INTEGER NOT NULL DEFAULT 1,
            beds INTEGER NOT NULL DEFAULT 1,
            min_nights INTEGER DEFAULT 1,
            max_nights INTEGER DEFAULT 30,
            cancellation_policy VARCHAR(20) DEFAULT 'moderate' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unlisted')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- 5. Property Amenities Table
        CREATE TABLE IF NOT EXISTS property_amenities (
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
            PRIMARY KEY (property_id, amenity_id)
        );

        -- 6. Property Photos Table
        CREATE TABLE IF NOT EXISTS property_photos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- 7. Availability Blocks Table
        CREATE TABLE IF NOT EXISTS availability_blocks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason VARCHAR(50) DEFAULT 'host_blocked' CHECK (reason IN ('host_blocked', 'booking', 'maintenance')),
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- 8. Bookings Table
        CREATE TABLE IF NOT EXISTS bookings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) NOT NULL,
            guest_id UUID REFERENCES users(id) NOT NULL,
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            guests_count INTEGER NOT NULL DEFAULT 1,
            total_nights INTEGER NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed', 'cancelled')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- 9. Payments Table
        CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            booking_id UUID REFERENCES bookings(id) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            method VARCHAR(50) NOT NULL,
            status VARCHAR(20) DEFAULT 'completed',
            transaction_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- 10. Property Reviews Table
        CREATE TABLE IF NOT EXISTS property_reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID REFERENCES properties(id) NOT NULL,
            booking_id UUID REFERENCES bookings(id) NOT NULL,
            guest_id UUID REFERENCES users(id) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
            accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
            communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
            location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
            value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
            text TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(booking_id, guest_id)
        );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_properties_host ON properties(host_id);
        CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
        CREATE INDEX IF NOT EXISTS idx_properties_country ON properties(country);
        CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
        CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_night);
        CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
        CREATE INDEX IF NOT EXISTS idx_availability_property ON availability_blocks(property_id);
        CREATE INDEX IF NOT EXISTS idx_availability_dates ON availability_blocks(start_date, end_date);
        CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);
    `;

    try {
        await query(createTablesQuery);
        console.log("All 10 Database tables created successfully!");
    } catch (error) {
        console.log(" Error creating database tables:", error);
        process.exit(1);
    }
};

module.exports = { initDatabase };