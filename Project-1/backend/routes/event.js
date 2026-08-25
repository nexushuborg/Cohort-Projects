const express = require('express');
const router = express.Router();
const db = require('../models/connection');
const { authenticate, authorize } = require('../middleware/auth');

// POST 
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => 
    {
  try {
    const { title, description, category, venueId, eventDate, eventEndDate } = req.body;

    const result = await db.query(
      `INSERT INTO events (title, description, category, venue_id, organizer_id, event_date, event_end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING *`,
      [title, description, category, venueId || null, req.user.sub, eventDate, eventEndDate || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) 
    {
    res.status(500).json(
        { success: false, error: { code: 'ERROR', message: err.message } 
    });
  }
});

// GET event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT e.*, v.name AS venue_name, v.address AS venue_address, v.city AS venue_city
       FROM events e LEFT JOIN venues v ON v.id = e.venue_id WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Event not found'
        }
      });
    }

    const ticketTiers = await db.query(
      `SELECT * FROM ticket_tiers
       WHERE event_id = $1
       ORDER BY price ASC`,
      [id]
    );

    res.json({
      success: true,
      data: { ...result.rows[0], ticketTiers: ticketTiers.rows }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message
      }
    });
  }
});

// GET 
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT e.*, v.name AS venue_name, v.city AS venue_city FROM events e LEFT JOIN venues v ON v.id = e.venue_id ORDER BY e.created_at DESC`);
    res.json({ success: true, data: { items: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST 
router.post('/:id/publish', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let result;
    if (req.user.role === 'admin') {
      result = await db.query(
        `UPDATE events SET status = 'published', updated_at = NOW() 
         WHERE id = $1 RETURNING *`,
        [id]
      );
    } else {
      result = await db.query(
        `UPDATE events SET status = 'published', updated_at = NOW() 
         WHERE id = $1 AND organizer_id = $2 RETURNING *`,
        [id, req.user.sub]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST 
router.post('/:id/tiers', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, totalQuantity, saleStart, saleEnd } = req.body;

    const eventCheck = await db.query(`SELECT organizer_id FROM events WHERE id = $1`, [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }
    if (req.user.role !== 'admin' && eventCheck.rows[0].organizer_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your event' } });
    }

    const result = await db.query(
      `INSERT INTO ticket_tiers (event_id, name, price, total_quantity, sale_start, sale_end)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, name, price, totalQuantity, saleStart || null, saleEnd || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

module.exports = router;
