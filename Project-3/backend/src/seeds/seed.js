const bcrypt = require('bcrypt');
const db = require('../config/database.js');

const seedDatabase = async () => {
    try {
        const adminHash = await bcrypt.hash("Admin123!", 10);
        const hostHash = await bcrypt.hash("Host123!", 10);
        const guestHash = await bcrypt.hash("Guest123!", 10);

        const usersResult = await db.query(`
            INSERT INTO users (email, password_hash, name, role, phone, bio)
            VALUES ('admin@test.com', $1, 'System Admin', 'admin', '+91 9999999999', 'Platform Administrator'),
                ('host@test.com', $2, 'Priya Sharma', 'host', '+91 9876543210', 'Superhost in Goa & Mumbai'),
                ('host2@test.com', $2, 'Rahul Verma', 'host', '+91 9876543211', 'Heritage villa owner in Jaipur & Manali'),
                ('guest@test.com', $3, 'Aarav Gupta', 'guest', '+91 9876543212', 'Avid traveler & guest')
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id, email, role;
        `, [adminHash, hostHash, guestHash]);

        const userMap = {};
        usersResult.rows.forEach(row => { userMap[row.email] = row.id; });

        const typesResult = await db.query(`SELECT id, name FROM property_types;`);
        const typeMap = {};
        typesResult.rows.forEach(row => { typeMap[row.name] = row.id; });

        await db.query(`
            INSERT INTO properties (host_id, property_type_id, title, description, address, city, country, price_per_night, max_guests, bedrooms, bathrooms, beds, status)
            VALUES 
                ($1, $3, 'Luxury Seafront Villa in Calangute', 'Beautiful 4-bedroom beachfront villa with private pool and sea view', '123 Beach Road', 'Goa', 'India', 6500.00, 8, 4, 3, 5, 'published'),
                ($1, $4, 'Modern Penthouse Apartment in Bandra', 'Cozy penthouse overlooking the Mumbai skyline with high-speed WiFi', '45 Hill Road', 'Mumbai', 'India', 4500.00, 4, 2, 2, 2, 'published'),
                ($2, $3, 'Royal Heritage Palace Villa in Pink City', 'Traditional Rajasthani palace stay with private courtyard & rooftop views', '88 Palace Road', 'Jaipur', 'India', 5500.00, 6, 3, 3, 3, 'published'),
                ($2, $5, 'Snow Mountain View Cabin in Solang', 'Wooden mountain cabin surrounded by snow peaks and pine forests', '12 Mountain Trail', 'Manali', 'India', 3500.00, 4, 2, 1, 2, 'published');
        `, [userMap['host@test.com'], userMap['host2@test.com'], typeMap['Villa'] || null, typeMap['Apartment'] || null, typeMap['Cabin'] || null]);

        console.log("Seed Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedDatabase();
