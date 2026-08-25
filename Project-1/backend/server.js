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

const app = express();

app.use(cors());
app.use(express.json());

// Boot Database
createTables();

// Register Routes
app.use('/auth', authRoutes);
app.use('/venues', venueRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});