const Joi = require('joi');

const registerDriverSchema = Joi.object({
  licenseNumber: Joi.string()
    .max(100)
    .allow('', null),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('offline', 'online', 'on_trip')
    .required(),
});

module.exports = {
  registerDriverSchema,
  updateStatusSchema,
};