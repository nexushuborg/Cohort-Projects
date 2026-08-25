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

// Get my bookings
router.get(
  '/',
  authenticateToken,
  controller.getMyBookings
);

// Get a booking by ID
router.get(
  '/:id',
  authenticateToken,
  controller.getBookingById
);

// Accept a booking
router.patch(
  '/:id/accept',
  authenticateToken,
  controller.acceptBooking
);

// Decline a booking
router.patch(
  '/:id/decline',
  authenticateToken,
  controller.declineBooking
);

// Cancel a booking
router.patch(
  '/:id/cancel',
  authenticateToken,
  controller.cancelBooking
);

// Start a trip
router.patch(
  '/:id/start',
  authenticateToken,
  controller.startTrip
);

// Complete a trip
router.patch(
  '/:id/complete',
  authenticateToken,
  controller.completeTrip
);

module.exports = router;