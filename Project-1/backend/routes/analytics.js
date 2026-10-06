const express = require('express');
const router = express.Router();
const db = require('../models/connection');
const { authenticate, authorize } = require('../middleware/auth');



router.get('/organizer', authenticate, authorize('organizer', 'admin'), async (req, res) => {

  try {
    const result = await db.query(
       `SELECT
         e.id AS event_id,
         e.title,
         e.status,
         e.event_date,
         COUNT(DISTINCT t.id) AS tickets_sold,
         COALESCE(SUM(DISTINCT p.amount), 0) AS revenue
       FROM events e
       LEFT JOIN bookings b ON b.event_id = e.id AND b.status = 'confirmed'
       LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'completed'
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       LEFT JOIN tickets t ON t.booking_item_id = bi.id AND t.status != 'cancelled'
       WHERE e.organizer_id = $1
       GROUP BY e.id, e.title, e.status, e.event_date
       ORDER BY e.created_at DESC`,
      [req.user.sub]

    );


    const totals = result.rows.reduce(
      (acc, row) => {
        acc.totalTicketsSold += Number(row.tickets_sold);
        acc.totalRevenue += Number(row.revenue);
        return acc;
      },
      { totalTicketsSold: 0, totalRevenue: 0 }
    );

    res.json(
        { 
           status: 'Success',
            data: { events: result.rows, totals, totalEvents: result.rows.length } 
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




router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [users, events, tickets, revenue] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(`SELECT COUNT(*) FROM events`),
      db.query(`SELECT COUNT(*) FROM tickets WHERE status != 'cancelled'`),
      db.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'`),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: Number(users.rows[0].count),
        totalEvents: Number(events.rows[0].count),
        totalTickets: Number(tickets.rows[0].count),
        totalRevenue: Number(revenue.rows[0].total),
      },
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
