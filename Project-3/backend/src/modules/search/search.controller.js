const db = require('../../config/database.js');

const searchProperties = async (req, res) => {
    const { city, minPrice, maxPrice, guests } = req.query;

    let getPropertiesQuery = `
        SELECT p.*, pt.name as property_type_name, u.name as host_name
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN users u ON p.host_id = u.id
        WHERE p.status = 'published'
    `;

    const params = [];

    if (city) {
        params.push(`%${city}%`);
        getPropertiesQuery += ` AND p.city ILIKE $${params.length}`;
    }

    if (minPrice) {
        params.push(minPrice);
        getPropertiesQuery += ` AND p.price_per_night >= $${params.length}`;
    }

    if (maxPrice) {
        params.push(maxPrice);
        getPropertiesQuery += ` AND p.price_per_night <= $${params.length}`;
    }

    if (guests) {
        params.push(guests);
        getPropertiesQuery += ` AND p.max_guests >= $${params.length}`;
    }

    getPropertiesQuery += ` ORDER BY p.created_at DESC;`;

    try {
        const result = await db.query(getPropertiesQuery, params);
        return res.status(200).json({
            status: "success",
            message: "Properties retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to search properties",
            error: error
        });
    }
};

module.exports = { searchProperties };