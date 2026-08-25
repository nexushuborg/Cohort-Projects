const db = require('../../config/database.js');

const createBooking = async (req, res) => {
    const { property_id, check_in, check_out, guests_count } = req.body;
    const guest_id = req.user.id;

    try {
        const getPropertyQuery = `
            SELECT * FROM properties
            WHERE id = $1;
        `;
        const propertyResult = await db.query(getPropertyQuery, [property_id]);

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Property not found"
            });
        }

        const property = propertyResult.rows[0];

        if (guests_count > property.max_guests) {
            return res.status(400).json({
                status: "failed",
                message: `Maximum guest limit for this property is ${property.max_guests}`
            });
        }

        const checkConflictQuery = `
            SELECT * FROM availability_blocks
            WHERE property_id = $1 AND start_date < $2 AND end_date > $3;
        `;
        const conflictResult = await db.query(checkConflictQuery, [property_id, check_out, check_in]);

        if (conflictResult.rows.length > 0) {
            return res.status(409).json({
                status: "failed",
                message: "Selected dates are unavailable or already booked."
            });
        }

        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const total_nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        if (total_nights <= 0) {
            return res.status(400).json({
                status: "failed",
                message: "Check-out date must be after check-in date."
            });
        }

        const minNights = property.min_nights || 1;
        const maxNights = property.max_nights || 30;

        if (total_nights < minNights) {
            return res.status(400).json({
                status: "failed",
                message: `Stay duration of ${total_nights} nights is below the minimum limit of ${minNights} nights required by the host.`
            });
        }

        if (total_nights > maxNights) {
            return res.status(400).json({
                status: "failed",
                message: `Stay duration of ${total_nights} nights exceeds the maximum limit of ${maxNights} nights.`
            });
        }

        const total_price = total_nights * parseFloat(property.price_per_night);

        const createBookingQuery = `
            INSERT INTO bookings (property_id, guest_id, check_in, check_out, guests_count, total_nights, total_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING *;
        `;

        const bookingResult = await db.query(createBookingQuery, [
            property_id,
            guest_id,
            check_in,
            check_out,
            guests_count,
            total_nights,
            total_price
        ]);

        return res.status(201).json({
            status: "success",
            message: "Booking request submitted successfully",
            data: bookingResult.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to create booking",
            error: error
        });
    }
};

const approveBooking = async (req, res) => {
    const { id } = req.params;

    const updateBookingQuery = `
        UPDATE bookings
        SET status = 'approved', updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;

    try {
        const result = await db.query(updateBookingQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Booking not found"
            });
        }

        const booking = result.rows[0];

        const blockCalendarQuery = `
            INSERT INTO availability_blocks (property_id, start_date, end_date, reason)
            VALUES ($1, $2, $3, 'booking');
        `;
        await db.query(blockCalendarQuery, [booking.property_id, booking.check_in, booking.check_out]);

        return res.status(200).json({
            status: "success",
            message: "Booking approved and calendar dates blocked",
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to approve booking",
            error: error
        });
    }
};

const declineBooking = async (req, res) => {
    const { id } = req.params;

    const updateBookingQuery = `
        UPDATE bookings
        SET status = 'declined', updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;

    try {
        const result = await db.query(updateBookingQuery, [id]);

        return res.status(200).json({
            status: "success",
            message: "Booking request declined",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to decline booking",
            error: error
        });
    }
};

const getGuestTrips = async (req, res) => {
    const guest_id = req.user.id;

    const getTripsQuery = `
        SELECT b.*, p.title as property_title, p.city, p.country 
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE b.guest_id = $1
        ORDER BY b.created_at DESC;
    `;

    try {
        const result = await db.query(getTripsQuery, [guest_id]);

        return res.status(200).json({
            status: "success",
            message: "Retrieved guest trips successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch trips",
            error: error
        });
    }
};

const getHostBookings = async (req, res) => {
    const host_id = req.user.id;

    const getBookingsQuery = `
        SELECT b.*, p.title as property_title, u.name as guest_name, u.email as guest_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.guest_id = u.id
        WHERE p.host_id = $1
        ORDER BY b.created_at DESC;
    `;

    try {
        const result = await db.query(getBookingsQuery, [host_id]);

        return res.status(200).json({
            status: "success",
            message: "Retrieved host bookings successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch host bookings",
            error: error
        });
    }
};

const getBookingById = async (req, res) => {
    const { id } = req.params;

    const getBookingQuery = `
        SELECT b.*, p.title as property_title, p.address, p.city, p.country,
               u.name as guest_name, u.email as guest_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.guest_id = u.id
        WHERE b.id = $1;
    `;

    try {
        const result = await db.query(getBookingQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Retrieved booking details successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch booking details",
            error: error
        });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const { cancellation_reason } = req.body;

    const checkBookingQuery = `
        SELECT b.*, p.host_id FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE b.id = $1;
    `;

    try {
        const bookingResult = await db.query(checkBookingQuery, [id]);

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Booking not found"
            });
        }

        const booking = bookingResult.rows[0];

        if (booking.guest_id !== user_id && booking.host_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: "failed",
                message: "Unauthorized to cancel this booking"
            });
        }

        const updateCancelQuery = `
            UPDATE bookings
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(updateCancelQuery, [id]);

        const removeBlockQuery = `
            DELETE FROM availability_blocks
            WHERE property_id = $1 AND start_date = $2 AND end_date = $3 AND reason = 'booking';
        `;
        await db.query(removeBlockQuery, [booking.property_id, booking.check_in, booking.check_out]);

        return res.status(200).json({
            status: "success",
            message: "Booking cancelled successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to cancel booking",
            error: error
        });
    }
};

const getAllBookings = async (req, res) => {
    const getAllQuery = `
        SELECT b.*, p.title as property_title, u.name as guest_name, u.email as guest_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.guest_id = u.id
        ORDER BY b.created_at DESC;
    `;

    try {
        const result = await db.query(getAllQuery);

        return res.status(200).json({
            status: "success",
            message: "Retrieved all bookings successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch bookings",
            error: error
        });
    }
};

module.exports = {
    createBooking,
    approveBooking,
    declineBooking,
    getGuestTrips,
    getHostBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
};

