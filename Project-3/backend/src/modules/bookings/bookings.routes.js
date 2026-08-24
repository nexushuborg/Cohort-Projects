const bookingRoute = require('express').Router();
const {
    createBooking,
    approveBooking,
    declineBooking,
    getGuestTrips,
    getHostBookings,
    getBookingById,
    cancelBooking
} = require('./bookings.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

bookingRoute
    .post('/', authMiddleware, createBooking)
    .get('/my', authMiddleware, getGuestTrips)
    .get('/host', authMiddleware, rbacMiddleware(['host', 'admin']), getHostBookings)
    .get('/:id', authMiddleware, getBookingById)
    .post('/:id/approve', authMiddleware, rbacMiddleware(['host', 'admin']), approveBooking)
    .post('/:id/decline', authMiddleware, rbacMiddleware(['host', 'admin']), declineBooking)
    .post('/:id/cancel', authMiddleware, cancelBooking);

module.exports = { bookingRoute };