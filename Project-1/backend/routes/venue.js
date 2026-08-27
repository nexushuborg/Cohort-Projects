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

module.exports = router;