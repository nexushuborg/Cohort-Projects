const reviewRoute = require('express').Router();
const {
    createPropertyReview,
    getPropertyReviews,
    createGuestReview,
    updateReview,
    deleteReview
} = require('./reviews.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

reviewRoute
    .post('/property', authMiddleware, createPropertyReview)
    .get('/property/:propertyId', getPropertyReviews)
    .post('/guest/:bookingId', authMiddleware, rbacMiddleware(['host', 'admin']), createGuestReview)
    .put('/:id', authMiddleware, updateReview)
    .delete('/:id', authMiddleware, deleteReview);

module.exports = { reviewRoute };