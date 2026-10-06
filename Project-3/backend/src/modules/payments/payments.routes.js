const paymentsRoute = require('express').Router();
const { processPayment, getPaymentByBooking } = require('./payments.controller.js');
const { authMiddleware } = require('../../middleware/authMiddleware.js');

paymentsRoute
    .post('/process', authMiddleware, processPayment)
    .get('/:bookingId', authMiddleware, getPaymentByBooking);

module.exports = { paymentsRoute };