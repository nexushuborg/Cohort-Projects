const express = require('express');
const controller = require('./rides.controller');
const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

// Get my rides as a driver
router.get(
  '/my',
  authenticateToken,
  controller.getMyRides
);

// Create a new ride
router.post(
  '/',
  authenticateToken,
  controller.createRide
);

// Start a ride (driver)
router.post(
  '/:id/start',
  authenticateToken,
  controller.startRide
);

// Cancel a ride (driver)
router.post(
  '/:id/cancel',
  authenticateToken,
  controller.cancelRide
);

// Get a ride by ID
router.get(
  '/:id',
  controller.getRideById
);

module.exports = router;