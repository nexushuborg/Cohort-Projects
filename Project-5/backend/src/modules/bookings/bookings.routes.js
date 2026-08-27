const express = require('express');

const controller = require('./bookings.controller');

const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

// Create a new booking
router.post(
  '/',
  authenticateToken,
  controller.createBooking
);

// Get rider's bookings
router.get(
  '/my',
  authenticateToken,
  controller.getMyBookings
);

// Get driver's bookings
router.get(
  '/driver',
  authenticateToken,
  controller.getDriverBookings
);

// Get a booking by ID
router.get(
  '/:id',
  authenticateToken,
  controller.getBookingById
);

// Accept a booking
router.post(
  '/:id/accept',
  authenticateToken,
  controller.acceptBooking
);

// Decline a booking
router.post(
  '/:id/decline',
  authenticateToken,
  controller.declineBooking
);

// Cancel a booking
router.post(
  '/:id/cancel',
  authenticateToken,
  controller.cancelBooking
);

// Start a trip
router.post(
  '/:id/start',
  authenticateToken,
  controller.startTrip
);

// Complete a trip
router.post(
  '/:id/complete',
  authenticateToken,
  controller.completeTrip
);

module.exports = router;