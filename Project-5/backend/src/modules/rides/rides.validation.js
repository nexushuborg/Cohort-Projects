const Joi = require('joi');

const createRideSchema = Joi.object({
  
  originAddress: Joi.string().min(5).max(500).required(),
  originLat: Joi.number().min(-90).max(90).required(),
  originLng: Joi.number().min(-180).max(180).required(),
  originCity: Joi.string().min(2).max(100).required(),

  destinationAddress: Joi.string().min(5).max(500).required(),
  destinationLat: Joi.number().min(-90).max(90).required(),
  destinationLng: Joi.number().min(-180).max(180).required(),
  destinationCity: Joi.string().min(2).max(100).required(),

  departureAt: Joi.date().iso().greater('now').required(),

 
  pricePerSeat: Joi.number().min(1).required(),

  notes: Joi.string().max(1000).allow('', null)
});

module.exports = {
  createRideSchema
};