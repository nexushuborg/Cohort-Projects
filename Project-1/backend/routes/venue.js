const express = require('express');
const router = express.Router();
const db = require('../models/connection');
const { authenticate, authorize } = require('../middleware/auth');

// POST 
router.post('/', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const { name, address, city, state, country, zipCode, capacity } = req.body;

    const result = await db.query(
      `INSERT INTO venues (name, address, city, state, country, zip_code, capacity, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, address, city, state, country, zipCode, capacity, req.user.sub]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// GET 
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM venues ORDER BY created_at DESC');
    res.json({ success: true, data: { items: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/:id/seats', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const venue = await db.query('SELECT * FROM venues WHERE id = $1', [req.params.id]);
    if (!venue.rows.length) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Venue not found' } });
    if (req.user.role !== 'admin' && venue.rows[0].created_by !== req.user.sub) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your venue' } });
    const { seats } = req.body;
    if (!Array.isArray(seats) || !seats.length) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Provide at least one seat' } });
    const values = seats.map((seat) => [req.params.id, String(seat.seatNumber || seat), seat.section || null]);
    const added = [];
    for (const value of values) {
      const result = await db.query(`INSERT INTO venue_seats (venue_id, seat_number, section) VALUES ($1, $2, $3) ON CONFLICT (venue_id, seat_number) DO NOTHING RETURNING *`, value);
      if (result.rows[0]) added.push(result.rows[0]);
    }
    res.status(201).json({ success: true, data: { items: added } });
  } catch (err) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }); }
});

router.get('/:id/seats', async (req, res) => {
  try {
    const result = await db.query(`SELECT s.*, CASE WHEN b.id IS NOT NULL THEN 'booked' WHEN h.id IS NOT NULL THEN 'held' ELSE 'available' END AS availability
      FROM venue_seats s
      LEFT JOIN booking_items bi ON bi.seat_id = s.id
      LEFT JOIN bookings b ON b.id = bi.booking_id AND b.status <> 'cancelled'
      LEFT JOIN seat_holds h ON h.seat_id = s.id AND h.expires_at > NOW()
      WHERE s.venue_id = $1 ORDER BY s.section NULLS FIRST, s.seat_number`, [req.params.id]);
    res.json({ success: true, data: { items: result.rows } });
  } catch (err) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }); }
});

module.exports = router;
