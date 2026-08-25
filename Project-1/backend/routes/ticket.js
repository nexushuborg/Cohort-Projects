const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const db = require('../models/connection');
const { authenticate, authorize } = require('../middleware/auth');


router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, bi.ticket_tier_id, b.event_id, e.title AS event_title
       FROM tickets t
       JOIN booking_items bi ON bi.id = t.booking_item_id
       JOIN bookings b ON b.id = bi.booking_id
       JOIN events e ON e.id = b.event_id
       WHERE b.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.sub]
    );
    res.json(
        { 
            status: 'failed',
             data: { items: result.rows } 
         });
  } catch (err) {
    res.status(500).json(
        { 
            status: 'failed',
             error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});


router.get('/:id/qr', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT t.*, b.user_id
       FROM tickets t
       JOIN booking_items bi ON bi.id = t.booking_item_id
       JOIN bookings b ON b.id = bi.booking_id
       WHERE t.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json(
        { 
            status: 'failed', 
            error: { 
                code: 'NOT_FOUND', 
                message: 'Ticket not found' 
            } 
        });
    }
    const ticket = result.rows[0];
    if (ticket.user_id !== req.user.sub && req.user.role !== 'admin') {
      return res.status(403).json(
        { 
            status: 'failed', 
            error: { 
                code: 'FORBIDDEN', 
                message: 'Not your ticket' 
            } 
        });
    }

    const qrDataUrl = await qrcode.toDataURL(ticket.qr_code);
    res.json({ success: true, data: { ticketId: ticket.id, qrImage: qrDataUrl } });
  } catch (err) {
    res.status(500).json(
        { 
            status: 'failed', 
            error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});


router.post('/check-in', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { ticketId, qrCode } = req.body;
    if (!ticketId && !qrCode) {
      return res.status(400).json(
        { 
            status: 'failed',
            error: { code: 'VALIDATION_ERROR', message: 'ticketId or qrCode is required' } 
        });
    }

    const result = await db.query(
      ticketId ? `SELECT * FROM tickets WHERE id = $1` : `SELECT * FROM tickets WHERE qr_code = $1`,
      [ticketId || qrCode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json(
        { 
            status: 'failed', 
            error: { 
                code: 'NOT_FOUND', 
                message: 'Ticket not found' 
            } 
        });
    }
    const ticket = result.rows[0];

    if (ticket.status === 'used') {
      return res.status(409).json(
        { 
            status: 'failed', 
            error: { 
                code: 'CONFLICT', 
                message: 'Ticket already used' 
            } 
        });
    }
    if (ticket.status === 'cancelled') {
      return res.status(409).json(
        { 
            status: 'failed', 
            error: { 
                code: 'CONFLICT', 
                message: 'Ticket is cancelled' 
            } 
        });
    }

    const updated = await db.query(
      `UPDATE tickets SET status = 'used', checked_in_at = NOW() WHERE id = $1 RETURNING *`,
      [ticket.id]
    );

    res.json(
        { 
            status: 'failed', 
            data: updated.rows[0] 
        });
  } catch (err) {
    res.status(500).json(
        { 
            status: 'failed', 
            error: { 
                code: 'INTERNAL_ERROR', 
                message: err.message 
            } 
        });
  }
});

module.exports = router;
