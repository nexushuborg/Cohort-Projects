const express = require('express');

const router = express.Router();

const ratingsController =
  require('./ratings.controller');

const {
  createRatingSchema,
  userRatingsParamsSchema,
  rideRatingsParamsSchema
} = require('./ratings.validation');

const {
  authenticateToken
} = require('../../middleware/auth.middleware');

const validate =
  require('../../middleware/validate.middleware');

router.post(
  '/',
  authenticateToken,
  validate(createRatingSchema),
  ratingsController.createRating
);

router.get(
  '/user/:userId',
  validate(userRatingsParamsSchema),
  ratingsController.getRatingsForUser
);

router.get(
  '/ride/:rideId',
  validate(rideRatingsParamsSchema),
  ratingsController.getRatingsForRide
);

module.exports = router;