const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../models/connection');
const { authenticate } = require('../middleware/auth');
const { withTransaction } = require('../utils/transaction');



router.post('/process', authenticate, async (req, res) => {
  try {
    const { bookingId, method } = req.body;

    if (!bookingId) {
      return res.status(400).json(
        { 
            status: 'failed',
            message: 'bookingId is required'  
        });
    }

    const result = await withTransaction(async (client) => {

      const bookingRes = await client.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);

      if (bookingRes.rows.length === 0) {
        const err = new Error('Booking not found');
        err.code = 'NOT_FOUND';
        throw err;
      }

      const booking = bookingRes.rows[0];

      if (booking.user_id !== req.user.sub) {
        const err = new Error('Not your booking');
        err.code = 'FORBIDDEN';
        throw err;
      }

      if (booking.status === 'confirmed') {
        const err = new Error('Booking already paid');
        err.code = 'CONFLICT';
        throw err;
      }

      if (booking.status === 'cancelled') {
        const err = new Error('Booking is cancelled');
        err.code = 'CONFLICT';
        throw err;
      }


      const transactionId = 'SIM_' + crypto.randomUUID();

      const paymentRes = await client.query(
        `INSERT INTO payments (booking_id, amount, method, status, transaction_id)
         VALUES ($1, $2, $3, 'completed', $4)
         RETURNING *`,
        [bookingId, booking.total_amount, method || 'simulated', transactionId]
      );

      await client.query(
        `UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
        [bookingId]
      );



      const items = await client.query(`SELECT * FROM booking_items WHERE booking_id = $1`, [bookingId]);

      const tickets = [];
      for (const item of items.rows) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketId = crypto.randomUUID();
          const qrPayload = `${ticketId}::${booking.event_id}`;
          const ticketRes = await client.query(
            `INSERT INTO tickets (id, booking_item_id, qr_code, status)
             VALUES ($1, $2, $3, 'valid')
             RETURNING *`,
            [ticketId, item.id, qrPayload]
          );
          tickets.push(ticketRes.rows[0]);
        }
      }

      return { payment: paymentRes.rows[0], tickets };
    });

    res.status(201).json(
        { 
            status: 'success',
            data: result 
        });
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ status: 'failed',error: { code: 'NOT_FOUND', message: err.message } });
    if (err.code === 'FORBIDDEN') return res.status(403).json({ status: 'failed',error: { code: 'FORBIDDEN', message: err.message } });
    if (err.code === 'CONFLICT') return res.status(409).json({  status: 'failed',error: { code: 'CONFLICT', message: err.message } });
    res.status(500).json(
        { 
            status: 'failed',
            message: 'INTERNAL_ERROR',
            error: err.message 
        });
  }
});


router.get('/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingRes = await db.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json(
        { 
            status: 'failed',
            message: 'Booking not found' 
        });
    }
    if (bookingRes.rows[0].user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json(
        { 
            status: 'failed',
            message: 'Not your booking' 
        });
    }

    const result = await db.query(`SELECT * FROM payments WHERE booking_id = $1`, [bookingId]);
    res.json(
        {  status: 'success', 
            data: result.rows[0] || null 
        });
  } catch (err) {
    res.status(500).json(
        { 
            status: 'failed',
            message: 'INTERNAL_ERROR',
            error: err.message 
        });
  }
});

module.exports = router;
