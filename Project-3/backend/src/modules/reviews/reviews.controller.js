const db = require('../../config/database.js');

const createPropertyReview = async (req, res) => {
    const {
        property_id,
        booking_id,
        rating,
        cleanliness_rating,
        accuracy_rating,
        communication_rating,
        location_rating,
        value_rating,
        text
    } = req.body;

    const guest_id = req.user.id;

    try {
        const checkBookingQuery = `
            SELECT * FROM bookings
            WHERE id = $1 AND guest_id = $2;
        `;
        const bookingResult = await db.query(checkBookingQuery, [booking_id, guest_id]);

        if (bookingResult.rows.length === 0) {
            return res.status(403).json({
                status: "failed",
                message: "Review can only be posted for your completed stay"
            });
        }

        const createReviewQuery = `
            INSERT INTO property_reviews (
                property_id, booking_id, guest_id, rating, 
                cleanliness_rating, accuracy_rating, communication_rating, 
                location_rating, value_rating, text
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;

        const result = await db.query(createReviewQuery, [
            property_id,
            booking_id,
            guest_id,
            rating,
            cleanliness_rating || rating,
            accuracy_rating || rating,
            communication_rating || rating,
            location_rating || rating,
            value_rating || rating,
            text
        ]);

        return res.status(201).json({
            status: "success",
            message: "Review posted successfully",
            data: result.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to post review",
            error: error
        });
    }
};

const getPropertyReviews = async (req, res) => {
    const { propertyId } = req.params;

    const getReviewsQuery = `
        SELECT pr.*, u.name as guest_name, u.avatar_url 
        FROM property_reviews pr
        JOIN users u ON pr.guest_id = u.id
        WHERE pr.property_id = $1
        ORDER BY pr.created_at DESC;
    `;

    try {
        const result = await db.query(getReviewsQuery, [propertyId]);
        return res.status(200).json({
            status: "success",
            message: "Retrieved property reviews successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to retrieve reviews",
            error: error
        });
    }
};

module.exports = {
    createPropertyReview,
    getPropertyReviews
};