const Joi = require('joi');

const searchRidesQuerySchema = Joi.object({
  origin: Joi.string().allow('', null),
  destination: Joi.string().allow('', null),
  date: Joi.date().iso().allow('', null),
  seats: Joi.number().integer().min(1).default(1),
  sortBy: Joi.string().valid('price_per_seat', 'departure_at').default('departure_at'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

module.exports = {
  searchRidesQuerySchema
};