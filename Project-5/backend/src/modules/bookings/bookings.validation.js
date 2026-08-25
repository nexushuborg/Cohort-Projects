const Joi = require('joi');

const createBookingSchema = Joi.object({
  rideId: Joi.string()
    .uuid()
    .required(),

  seatsBooked: Joi.number()
    .integer()
    .min(1)
    .required(),

  message: Joi.string()
    .allow('', null)
    .max(500)
    .optional()
});

module.exports = {
  createBookingSchema
};