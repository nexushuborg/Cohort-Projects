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
      'SELECT * FROM events WHERE id = $1',
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

    res.json({
      success: true,
      data: result.rows[0]
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
    const result = await db.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json({ success: true, data: { items: result.rows } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST 
router.post('/:id/publish', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE events SET status = 'published', updated_at = NOW() 
       WHERE id = $1 AND organizer_id = $2 RETURNING *`,
      [id, req.user.sub]
    );

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