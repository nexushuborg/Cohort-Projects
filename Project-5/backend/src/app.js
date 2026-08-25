const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const errorHandler = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const rideRoutes = require('./modules/rides/rides.routes');
const walletRoutes = require('./modules/wallet/wallet.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const vehicleRoutes = require('./modules/vehicles/vehicles.routes');
const searchRoutes = require('./modules/search/search.routes');
const recentSearchesRoutes = require('./modules/search/recentSearches.routes');
const dashboardRoutes = require('./modules/dashboards/dashboards.routes');
const ratingRoutes = require('./modules/ratings/ratings.routes');
const bookingRoutes = require('./modules/bookings/bookings.routes');
const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('dev'));

app.use('/drivers', driverRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/ratings', ratingRoutes);
app.use('/bookings', bookingRoutes);


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ride Sharing API is running'
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/drivers', driverRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/rides/search', searchRoutes);
app.use('/rides', rideRoutes);
app.use('/wallet', walletRoutes);
app.use('/payments', paymentRoutes);
app.use('/recent-searches', recentSearchesRoutes);
app.use('/dashboards', dashboardRoutes);
app.use('/ratings', ratingRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server only when this file is run directly
if (require.main === module) {
  app.listen(env.port, () => {
    console.log(
      `Server running in ${env.nodeEnv} mode on port ${env.port}`
    );
  });
}

module.exports = app;