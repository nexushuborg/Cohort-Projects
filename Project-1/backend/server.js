require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');

const createTables = require('./database/initdatabase');
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venue');
const eventRoutes = require('./routes/event');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const ticketRoutes = require('./routes/ticket');
const reviewRoutes = require('./routes/review');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
});

// Register Routes
app.use('/auth', authRoutes);
app.use('/venues', venueRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/tickets', ticketRoutes);
app.use('/reviews', reviewRoutes);
app.use('/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;

createTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});