const Joi = require('joi');

const createRecentSearchSchema = Joi.object({
  origin: Joi.string().min(2).max(255).required(),
  destination: Joi.string().min(2).max(255).required(),
  searchDate: Joi.date().iso().allow(null, '')
});

module.exports = {
  createRecentSearchSchema
};