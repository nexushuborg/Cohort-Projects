const express = require('express');
const router = express.Router();
const db = require('../models/connection');
const { authenticate, authorize } = require('../middleware/auth');
const { withTransaction } = require('../utils/transaction');

const HOLD_MINUTES = 10;

router.post('/hold-seat', authenticate, async (req, res) => {
  try {
    const { seatId } = req.body;

    if (!seatId) {
      return res.status(400).json({ 
            status: "failure", 
            message: 'seatID is requires',
         });
    }

    await db.query(`DELETE FROM seat_holds WHERE seat_id = $1 AND expires_at < NOW()`, [seatId]);

    const activeHold = await db.query(
      `SELECT * FROM seat_holds WHERE seat_id = $1 AND expires_at >= NOW()`,
      [seatId]
    );
    if (activeHold.rows.length > 0) {
      if (activeHold.rows[0].user_id === req.user.sub) {
        return res.status(201).json({ 
          status: "Success",
          data: activeHold.rows[0] 
        });
      }
      return res.status(409).json(
        { 
            status : "failed",
            message: 'Seat is currently held by another user',
        });
    }

    const alreadyBooked = await db.query(
      `SELECT bi.id FROM booking_items bi
       JOIN bookings b ON b.id = bi.booking_id
       WHERE bi.seat_id = $1 AND b.status != 'cancelled'`,
      [seatId]
    );
    if (alreadyBooked.rows.length > 0) {
      return res.status(409).json({ 
                status: "failed" ,
                message: 'Seat already booked',
            });
    }

    const hold = await db.query(
      `INSERT INTO seat_holds (seat_id, user_id, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
       RETURNING *`,
      [seatId, req.user.sub]
    );

    res.status(201).json({ 
        status: "Success" ,
        data: hold.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ 
        status: "failed",
        message: "INTERNAL_ERROR",
        error: err.message
    });
  }
});


router.post('/', authenticate, authorize('attendee', 'admin'), async (req, res) => {
  try {
    const { eventId, ticketTierId, quantity, seatIds } = req.body;

    if (!eventId || !ticketTierId || !quantity) {
      return res.status(400).json(
        { 
            status: "failed",
            error: { 
                code: 'VALIDATION_ERROR', 
                message: 'eventId, ticketTierId and quantity are required' 
            } 
        });
    }
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json(
        { 
            status: "failed",
            error: { 
                code: 'VALIDATION_ERROR', 
                message: 'quantity must be between 1 and 10' } 
        });
    }

    const eventRes = await db.query(`SELECT * FROM events WHERE id = $1`, [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json(
        { 
            status: "failed", 
            error: { 
                code: 'NOT_FOUND', 
                message: 'Event not found' 
            } 
        });
    }
    if (eventRes.rows[0].status !== 'published') {
      return res.status(400).json(
        { 
            status: "failed",
            error: { 
                code: 'VALIDATION_ERROR', 
                message: 'Event is not published' 
            } 
        });
    }

    const tierRes = await db.query(`SELECT * FROM ticket_tiers WHERE id = $1 AND event_id = $2`, [ticketTierId, eventId]);
    if (tierRes.rows.length === 0) {
      return res.status(404).json(
        { 
            status: "failed",
            error: { code: 'NOT_FOUND', message: 'Ticket tier not found for this event' } 
        });
    }
    const tier = tierRes.rows[0];

    if (seatIds && seatIds.length !== quantity) {
      return res.status(400).json(
        { 
            status: "failed",
            error: { 
                code: 'VALIDATION_ERROR', 
                message: 'seatIds length must match quantity' 
            } 
        });
    }
    if (seatIds?.length && new Set(seatIds).size !== seatIds.length) return res.status(400).json({ status: 'failed', error: { code: 'VALIDATION_ERROR', message: 'Seats must be unique' } });

    if (seatIds?.length) {
      const seats = await db.query(`SELECT id FROM venue_seats WHERE venue_id = $1 AND id = ANY($2::uuid[])`, [eventRes.rows[0].venue_id, seatIds]);
      if (!eventRes.rows[0].venue_id || seats.rows.length !== seatIds.length) return res.status(400).json({ status: 'failed', error: { code: 'VALIDATION_ERROR', message: 'Selected seats do not belong to this event venue' } });
      const holds = await db.query(`SELECT seat_id FROM seat_holds WHERE user_id = $1 AND seat_id = ANY($2::uuid[]) AND expires_at > NOW()`, [req.user.sub, seatIds]);
      if (holds.rows.length !== seatIds.length) return res.status(409).json({ status: 'failed', error: { code: 'CONFLICT', message: 'Please hold all selected seats before booking' } });
    }

    const totalAmount = Number(tier.price) * quantity;

    const booking = await withTransaction(async (client) => {
      // Atomic inventory check + decrement in one statement — this is what prevents overselling
      const updatedTier = await client.query(
        `UPDATE ticket_tiers
         SET sold_quantity = sold_quantity + $1
         WHERE id = $2 AND sold_quantity + $1 <= total_quantity
         RETURNING *`,
        [quantity, ticketTierId]
      );

      if (updatedTier.rows.length === 0) {
        const err = new Error('Not enough tickets available');
        err.code = 'SOLD_OUT';
        throw err;
      }

      const bookingRes = await client.query(
        `INSERT INTO bookings (user_id, event_id, total_amount, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [req.user.sub, eventId, totalAmount]
      );
      const bookingRow = bookingRes.rows[0];

      if (seatIds && seatIds.length > 0) {
        for (const seatId of seatIds) {
          await client.query(
            `INSERT INTO booking_items (booking_id, ticket_tier_id, seat_id, quantity, price_at_purchase)
             VALUES ($1, $2, $3, 1, $4)`,
            [bookingRow.id, ticketTierId, seatId, tier.price]
          );
          await client.query(`DELETE FROM seat_holds WHERE seat_id = $1 AND user_id = $2`, [seatId, req.user.sub]);
        }
      } else {
        await client.query(
          `INSERT INTO booking_items (booking_id, ticket_tier_id, seat_id, quantity, price_at_purchase)
           VALUES ($1, $2, NULL, $3, $4)`,
          [bookingRow.id, ticketTierId, quantity, tier.price]
        );
      }

      return bookingRow;
    });

    res.status(201).json(
            { 
                status: "success",
                data: booking 
            });
  } catch (err) {
    if (err.code === 'SOLD_OUT') {
      return res.status(409).json(
        { 
            status: "failed",
            error: { 
                code: 'CONFLICT', 
                message: 'Not enough tickets available' } 
        });
    }
    res.status(500).json(
        { 
            status: "failed",
            error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});

// GET /bookings/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, e.title AS event_title
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.sub]
    );
    res.json(
        { 
            status: "success", 
            data: { items: result.rows } 
    });
  } catch (err) {
    res.status(500).json(
        { 
            status : "failed",
            error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json(
        { 
            status: "failed",
            error: { code: 'NOT_FOUND', message: 'Booking not found' } 
        });
    }
    const booking = result.rows[0];
    if (booking.user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json(
        { 
            status: "failed",
            error: { 
                code: 'FORBIDDEN', 
                message: 'Not your booking' 
            } 
        });
    }

    const items = await db.query(`SELECT * FROM booking_items WHERE booking_id = $1`, [id]);
    res.json(
        { 
            status: "success", 
            data: { ...booking, items: items.rows } 
        });
  } catch (err) {
    res.status(500).json(
        { 
            status: "failed",
            error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});


router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await withTransaction(async (client) => {
      const bookingRes = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
      if (bookingRes.rows.length === 0) {
        const err = new Error('Booking not found');
        err.code = 'NOT_FOUND';
        throw err;
      }
      const booking = bookingRes.rows[0];
      if (booking.user_id !== req.user.sub && req.user.role !== 'admin') {
        const err = new Error('Not your booking');
        err.code = 'FORBIDDEN';
        throw err;
      }
      if (booking.status === 'cancelled') {
        const err = new Error('Already cancelled');
        err.code = 'CONFLICT';
        throw err;
      }

      const items = await client.query(`SELECT * FROM booking_items WHERE booking_id = $1`, [id]);
      for (const item of items.rows) {
        await client.query(
          `UPDATE ticket_tiers SET sold_quantity = sold_quantity - $1 WHERE id = $2 AND sold_quantity >= $1`,
          [item.quantity, item.ticket_tier_id]
        );
      }
      await client.query(
        `UPDATE tickets SET status = 'cancelled'
         WHERE booking_item_id IN (SELECT id FROM booking_items WHERE booking_id = $1)`,
        [id]
      );

      const updated = await client.query(
        `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      return updated.rows[0];
    });

    res.json(
        { 
            status: "success", 
            data: result 
        });
  } catch (err) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ status: "failed",error: { code: 'NOT_FOUND', message: err.message } });
    if (err.code === 'FORBIDDEN') return res.status(403).json({ status: "failed",error: { code: 'FORBIDDEN', message: err.message } });
    if (err.code === 'CONFLICT') return res.status(409).json({  status: "failed",error: { code: 'CONFLICT', message: err.message } });
    res.status(500).json(
        { 
            status: "failed",
            error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});

module.exports = router;
