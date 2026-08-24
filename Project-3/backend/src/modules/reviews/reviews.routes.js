const reviewRoute = require('express').Router();
const { createPropertyReview, getPropertyReviews } = require('./reviews.controller.js');
const { authMiddleware } = require('../../middleware/authMiddleware.js');

reviewRoute
    .post('/property', authMiddleware, createPropertyReview)
    .get('/property/:propertyId', getPropertyReviews);

module.exports = { reviewRoute };