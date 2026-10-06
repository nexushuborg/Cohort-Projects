const Joi = require('joi');

const currentYear = new Date().getFullYear();

const createVehicleSchema = Joi.object({
  make: Joi.string()
    .min(2)
    .max(100)
    .required(),

  model: Joi.string()
    .min(2)
    .max(100)
    .required(),

  year: Joi.number()
    .integer()
    .min(2000)
    .max(currentYear)
    .required(),

  color: Joi.string()
    .min(2)
    .max(50)
    .required(),

  licensePlate: Joi.string()
    .min(2)
    .max(20)
    .required(),

  seatCount: Joi.number()
    .integer()
    .min(2)
    .max(8)
    .required(),

  photoUrl: Joi.string()
    .uri()
    .allow('', null),
});

const updateVehicleSchema = Joi.object({
  make: Joi.string()
    .min(2)
    .max(100),

  model: Joi.string()
    .min(2)
    .max(100),

  year: Joi.number()
    .integer()
    .min(2000)
    .max(currentYear),

  color: Joi.string()
    .min(2)
    .max(50),

  licensePlate: Joi.string()
    .min(2)
    .max(20),

  seatCount: Joi.number()
    .integer()
    .min(2)
    .max(8),

  photoUrl: Joi.string()
    .uri()
    .allow('', null),
}).min(1);

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
};