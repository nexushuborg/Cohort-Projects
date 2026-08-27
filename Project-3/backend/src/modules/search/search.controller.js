const db = require('../../config/database.js');

const searchProperties = async (req, res) => {
    const {
        q, search, text,
        city, country,
        minPrice, maxPrice,
        guests,
        propertyType, property_type_id,
        amenities,
        sortBy, sort,
        page = 1, limit = 20
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    let whereClauses = ["p.status = 'published'"];
    let params = [];

    // 1. Text Search (Title or Description)
    const textQuery = q || search || text;
    if (textQuery && textQuery.trim() !== '') {
        params.push(`%${textQuery.trim()}%`);
        whereClauses.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }

    // 2. City Filter
    if (city && city.trim() !== '') {
        params.push(`%${city.trim()}%`);
        whereClauses.push(`p.city ILIKE $${params.length}`);
    }

    // 3. Country Filter
    if (country && country.trim() !== '') {
        params.push(`%${country.trim()}%`);
        whereClauses.push(`p.country ILIKE $${params.length}`);
    }

    // 4. Price Range Filter
    if (minPrice !== undefined && minPrice !== '') {
        params.push(Number(minPrice));
        whereClauses.push(`p.price_per_night >= $${params.length}`);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
        params.push(Number(maxPrice));
        whereClauses.push(`p.price_per_night <= $${params.length}`);
    }

    // 5. Guests Filter
    if (guests !== undefined && guests !== '') {
        params.push(Number(guests));
        whereClauses.push(`p.max_guests >= $${params.length}`);
    }

    // 6. Property Type Filter
    const typeId = property_type_id || propertyType;
    if (typeId && typeId.trim() !== '') {
        params.push(typeId.trim());
        whereClauses.push(`(p.property_type_id::text = $${params.length} OR pt.name ILIKE $${params.length})`);
    }

    // 7. Amenities Filter
    if (amenities) {
        const amenityList = Array.isArray(amenities)
            ? amenities
            : String(amenities).split(',').map(a => a.trim()).filter(Boolean);

        if (amenityList.length > 0) {
            params.push(amenityList);
            whereClauses.push(`
                p.id IN (
                    SELECT pa.property_id
                    FROM property_amenities pa
                    JOIN amenities a ON pa.amenity_id = a.id
                    WHERE pa.amenity_id::text = ANY($${params.length}) OR a.name = ANY($${params.length})
                    GROUP BY pa.property_id
                    HAVING COUNT(DISTINCT pa.amenity_id) = ${amenityList.length}
                )
            `);
        }
    }

    const whereSql = whereClauses.join(' AND ');

    // 8. Sorting
    let orderBySql = 'ORDER BY p.created_at DESC';
    const sortVal = sortBy || sort;

    if (sortVal === 'price_asc' || sortVal === 'price_low') {
        orderBySql = 'ORDER BY p.price_per_night ASC';
    } else if (sortVal === 'price_desc' || sortVal === 'price_high') {
        orderBySql = 'ORDER BY p.price_per_night DESC';
    } else if (sortVal === 'rating') {
        orderBySql = 'ORDER BY COALESCE(avg_rating, 0) DESC';
    } else if (sortVal === 'newest') {
        orderBySql = 'ORDER BY p.created_at DESC';
    }

    try {
        // Count query
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM properties p
            LEFT JOIN property_types pt ON p.property_type_id = pt.id
            WHERE ${whereSql};
        `;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total, 10) || 0;

        // Data query
        params.push(limitNum);
        const limitParamIndex = params.length;
        params.push(offset);
        const offsetParamIndex = params.length;

        const mainQuery = `
            SELECT 
                p.*, 
                pt.name as property_type_name, 
                u.name as host_name,
                COALESCE(AVG(pr.rating), 0) as avg_rating,
                COUNT(pr.id) as review_count
            FROM properties p
            LEFT JOIN property_types pt ON p.property_type_id = pt.id
            LEFT JOIN users u ON p.host_id = u.id
            LEFT JOIN property_reviews pr ON p.id = pr.property_id
            WHERE ${whereSql}
            GROUP BY p.id, pt.name, u.name
            ${orderBySql}
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex};
        `;

        const result = await db.query(mainQuery, params);

        return res.status(200).json({
            status: "success",
            message: "Properties retrieved successfully",
            data: {
                items: result.rows,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Failed to search properties",
            error: error.message
        });
    }
};

module.exports = { searchProperties };