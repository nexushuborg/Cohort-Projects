const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../models/connection');
const { authenticate } = require('../middleware/auth');

// POST 
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email registered' } });
    }

    const allowedRoles = ['attendee', 'organizer'];
    const userRole = allowedRoles.includes(role) ? role : 'attendee';

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      [email, password_hash, name, userRole]
    );

    const user = newUser.rows[0];
    const accessToken = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    const accessToken = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// GET 
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.sub]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// Demo-friendly reset flow: the token is returned instead of emailed. In production,
// send the token in a one-time email and never expose it in the response.
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } });
    const user = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!user.rows.length) return res.json({ success: true, data: { message: 'If that account exists, reset instructions have been sent.' } });
    const resetToken = crypto.randomBytes(24).toString('hex');
    await db.query(`UPDATE users SET password_reset_token = $1, password_reset_expires_at = NOW() + INTERVAL '30 minutes' WHERE id = $2`, [resetToken, user.rows[0].id]);
    res.json({ success: true, data: { message: 'Reset token generated. It expires in 30 minutes.', resetToken } });
  } catch (err) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A reset token and password of at least 6 characters are required' } });
    const user = await db.query(`SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires_at > NOW()`, [token]);
    if (!user.rows.length) return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'This reset token is invalid or has expired' } });
    const passwordHash = await bcrypt.hash(password, 10);
    await db.query(`UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL, updated_at = NOW() WHERE id = $2`, [passwordHash, user.rows[0].id]);
    res.json({ success: true, data: { message: 'Password reset successfully. You can now log in.' } });
  } catch (err) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }); }
});

module.exports = router;
