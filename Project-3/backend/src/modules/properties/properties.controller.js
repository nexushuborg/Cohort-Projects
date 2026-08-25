const db = require('../../config/database.js');

const createProperty = async (req, res) => {
    const {
        title, description, address, city, state, country, zip_code, latitude, longitude,
        price_per_night, max_guests, bedrooms, bathrooms, beds, min_nights, max_nights,
        cancellation_policy, property_type_id, amenity_ids
    } = req.body;

    const host_id = req.user.id;

    try {
        const createPropertyQuery = `
            INSERT INTO properties (
                host_id, property_type_id, title, description, address, 
                city, state, country, zip_code, latitude, longitude,
                price_per_night, max_guests, bedrooms, bathrooms, beds,
                min_nights, max_nights, cancellation_policy, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'published')
            RETURNING *;
        `;

        const result = await db.query(createPropertyQuery, [
            host_id, property_type_id || null, title, description, address,
            city, state || '', country, zip_code || null, latitude || null, longitude || null,
            price_per_night, max_guests || 1, bedrooms || 1, bathrooms || 1, beds || 1,
            min_nights || 1, max_nights || 30, cancellation_policy || 'moderate'
        ]);

        const property = result.rows[0];

        if (amenity_ids && Array.isArray(amenity_ids) && amenity_ids.length > 0) {
            for (let amenityId of amenity_ids) {
                const insertAmenityQuery = `
                    INSERT INTO property_amenities (property_id, amenity_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING;
                `;
                await db.query(insertAmenityQuery, [property.id, amenityId]);
            }
        }

        return res.status(201).json({
            status: "success",
            message: "Property created and published successfully",
            data: property
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to create property",
            error: error
        });
    }
};

const getProperties = async (req, res) => {
    const getPropertiesQuery = `
        SELECT p.*, pt.name as property_type_name, u.name as host_name 
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN users u ON p.host_id = u.id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC;
    `;

    try {
        const result = await db.query(getPropertiesQuery);
        return res.status(200).json({
            status: "success",
            message: "Retrieved properties successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch properties",
            error: error
        });
    }
};

const getPropertyById = async (req, res) => {
    const { id } = req.params;

    const getPropertyQuery = `
        SELECT p.*, pt.name as property_type_name, u.name as host_name, u.email as host_email, u.avatar_url as host_avatar
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN users u ON p.host_id = u.id
        WHERE p.id = $1;
    `;

    try {
        const result = await db.query(getPropertyQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Property not found"
            });
        }

        const property = result.rows[0];

        const getPhotosQuery = `SELECT url FROM property_photos WHERE property_id = $1;`;
        const photosResult = await db.query(getPhotosQuery, [id]);

        const getAmenitiesQuery = `
            SELECT a.* FROM amenities a
            JOIN property_amenities pa ON a.id = pa.amenity_id
            WHERE pa.property_id = $1;
        `;
        const amenitiesResult = await db.query(getAmenitiesQuery, [id]);

        property.photos = photosResult.rows;
        property.amenities = amenitiesResult.rows;

        return res.status(200).json({
            status: "success",
            message: "Retrieved property details successfully",
            data: property
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch property details",
            error: error
        });
    }
};

const getHostProperties = async (req, res) => {
    const host_id = req.user.id;

    const getHostPropertiesQuery = `
        SELECT * FROM properties  WHERE host_id = $1  ORDER BY created_at DESC;
    `;

    try {
        const result = await db.query(getHostPropertiesQuery, [host_id]);
        return res.status(200).json({
            status: "success",
            message: "Retrieved host properties successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch host properties",
            error: error
        });
    }
};

const updatePropertyStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const host_id = req.user.id;

    const updateStatusQuery = `
        UPDATE properties  SET status = $1, updated_at = NOW()  WHERE id = $2 AND host_id = $3  RETURNING *;
    `;

    try {
        const result = await db.query(updateStatusQuery, [status, id, host_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Property not found or unauthorized"
            });
        }

        return res.status(200).json({
            status: "success",
            message: `Property status updated to ${status}`,
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to update property status",
            error: error
        });
    }
};

const updateProperty = async (req, res) => {
    const { id } = req.params;
    const host_id = req.user.id;
    const {
        title, description, address, city, state, country, zip_code, latitude, longitude,
        price_per_night, max_guests, bedrooms, bathrooms, beds, min_nights, max_nights, cancellation_policy
    } = req.body;

    const updateQuery = `
        UPDATE properties
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            address = COALESCE($3, address),
            city = COALESCE($4, city),
            state = COALESCE($5, state),
            country = COALESCE($6, country),
            zip_code = COALESCE($7, zip_code),
            latitude = COALESCE($8, latitude),
            longitude = COALESCE($9, longitude),
            price_per_night = COALESCE($10, price_per_night),
            max_guests = COALESCE($11, max_guests),
            bedrooms = COALESCE($12, bedrooms),
            bathrooms = COALESCE($13, bathrooms),
            beds = COALESCE($14, beds),
            min_nights = COALESCE($15, min_nights),
            max_nights = COALESCE($16, max_nights),
            cancellation_policy = COALESCE($17, cancellation_policy),
            updated_at = NOW()
        WHERE id = $18 AND host_id = $19
        RETURNING *;
    `;

    try {
        const result = await db.query(updateQuery, [
            title, description, address, city, state, country, zip_code, latitude, longitude,
            price_per_night, max_guests, bedrooms, bathrooms, beds, min_nights, max_nights, cancellation_policy,
            id, host_id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Property not found or unauthorized"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Property updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to update property",
            error: error
        });
    }
};

const deleteProperty = async (req, res) => {
    const { id } = req.params;
    const host_id = req.user.id;

    const deleteQuery = `
        DELETE FROM properties
        WHERE id = $1 AND host_id = $2
        RETURNING *;
    `;

    try {
        const result = await db.query(deleteQuery, [id, host_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Property not found or unauthorized"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Property deleted successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to delete property",
            error: error
        });
    }
};

const uploadPropertyPhoto = async (req, res) => {
    const { id } = req.params;
    const { caption, sort_order } = req.body;

    if (!req.file) {
        return res.status(400).json({
            status: "failed",
            message: "No image file provided"
        });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const insertPhotoQuery = `
        INSERT INTO property_photos (property_id, url, caption, sort_order)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    try {
        const result = await db.query(insertPhotoQuery, [id, photoUrl, caption || null, sort_order || 0]);
        return res.status(201).json({
            status: "success",
            message: "Property photo uploaded successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to save property photo",
            error: error
        });
    }
};

const getPropertyTypes = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM property_types ORDER BY name ASC;`);
        return res.status(200).json({
            status: "success",
            message: "Retrieved property types successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch property types",
            error: error
        });
    }
};

const getAmenities = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM amenities ORDER BY name ASC;`);
        return res.status(200).json({
            status: "success",
            message: "Retrieved amenities successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch amenities",
            error: error
        });
    }
};

module.exports = {
    createProperty,
    getProperties,
    getPropertyById,
    getHostProperties,
    updatePropertyStatus,
    updateProperty,
    deleteProperty,
    uploadPropertyPhoto,
    getPropertyTypes,
    getAmenities
};