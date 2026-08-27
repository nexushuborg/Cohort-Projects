const db = require('../../config/database.js');
const { v4: uuidv4 } = require('uuid');

// 1. Process simulated payment
const processPayment = async (req, res) => {
    const { booking_id, amount, method } = req.body;
    const userId = req.user.id;

    if (!booking_id || !amount || !method) {
        return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "booking_id, amount, and method are required" }
        });
    }

    try {
        // Fetch booking to verify existence, host ID, and guest ID
        const bookingQuery = `
            SELECT b.*, p.host_id 
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.id = $1;
        `;
        const bookingRes = await db.query(bookingQuery, [booking_id]);

        if (bookingRes.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                success: false,
                message: "Booking not found",
                error: { code: "NOT_FOUND", message: "Booking not found" }
            });
        }

        const booking = bookingRes.rows[0];

        // Ensure user paying is the booking guest, host, or an admin
        if (booking.guest_id !== userId && booking.host_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                status: "failed",
                success: false,
                message: "Access denied. Only the booking guest or host can process payments.",
                error: { code: "FORBIDDEN", message: "Access denied. Only the booking guest or host can process payments." }
            });
        }

        // Check if a completed payment already exists for this booking
        const existingPaymentQuery = `SELECT * FROM payments WHERE booking_id = $1 AND status = 'completed';`;
        const existingPaymentRes = await db.query(existingPaymentQuery, [booking_id]);
        if (existingPaymentRes.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: { code: "CONFLICT", message: "Payment has already been processed for this booking." }
            });
        }

        // Simulate payment gateway processing
        // Generates a mock transaction ID (e.g. tx_abc123...)
        const transactionId = `tx_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
        
        const insertPaymentQuery = `
            INSERT INTO payments (booking_id, amount, method, status, transaction_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const paymentRes = await db.query(insertPaymentQuery, [
            booking_id,
            amount,
            method,
            'completed',
            transactionId
        ]);

        return res.status(201).json({
            success: true,
            message: "Payment processed successfully",
            data: paymentRes.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to process payment", details: error.message }
        });
    }
};

// 2. Fetch payment by booking ID
const getPaymentByBooking = async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;

    try {
        // Fetch booking to verify permissions (must be guest of booking, host of property, or admin)
        const bookingQuery = `
            SELECT b.*, p.host_id 
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.id = $1;
        `;
        const bookingRes = await db.query(bookingQuery, [bookingId]);

        if (bookingRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: "NOT_FOUND", message: "Booking not found" }
            });
        }

        const booking = bookingRes.rows[0];

        if (booking.guest_id !== userId && booking.host_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: { code: "FORBIDDEN", message: "Access denied. You do not have permissions to view this payment." }
            });
        }

        const paymentQuery = `SELECT * FROM payments WHERE booking_id = $1;`;
        const paymentRes = await db.query(paymentQuery, [bookingId]);

        if (paymentRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: "NOT_FOUND", message: "No payment record found for this booking" }
            });
        }

        return res.status(200).json({
            success: true,
            data: paymentRes.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to retrieve payment info", details: error.message }
        });
    }
};

module.exports = {
    processPayment,
    getPaymentByBooking
};