const Joi = require('joi');

const uuid = Joi.string().uuid();

const createRatingSchema = Joi.object({
  bookingId: uuid.required(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  text: Joi.string()
    .trim()
    .max(1000)
    .allow('', null)
    .optional()
});

const userRatingsParamsSchema = Joi.object({
  userId: uuid.required()
});

const rideRatingsParamsSchema = Joi.object({
  rideId: uuid.required()
});

module.exports = {
  createRatingSchema,
  userRatingsParamsSchema,
  rideRatingsParamsSchema
};