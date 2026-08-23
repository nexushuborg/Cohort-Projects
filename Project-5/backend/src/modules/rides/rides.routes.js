const express = require('express');
const controller = require('./rides.controller');

const router = express.Router();

// Create a new ride
router.post('/', controller.createRide);

// Get a ride by ID
router.get('/:id', controller.getRideById);

module.exports = router;