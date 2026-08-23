const bookingRoute = require('express').Router();
const { createBooking, approveBooking, declineBooking, getGuestTrips } = require('./bookings.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

bookingRoute
    .post('/', authMiddleware, createBooking)
    .get('/my', authMiddleware, getGuestTrips)
    .post('/:id/approve', authMiddleware, rbacMiddleware(['host', 'admin']), approveBooking)
    .post('/:id/decline', authMiddleware, rbacMiddleware(['host', 'admin']), declineBooking);

module.exports = { bookingRoute };