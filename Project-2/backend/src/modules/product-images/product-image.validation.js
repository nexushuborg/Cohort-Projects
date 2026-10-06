const Joi = require('joi');

/**
 * Params schema: validates :productId on routes
 */
const productParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
});

/**
 * Params schema: validates :imageId on routes
 */
const imageParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
  imageId: Joi.string().uuid().required().messages({
    'any.required': 'Image ID is required',
    'string.uuid': 'Image ID must be a valid UUID',
  }),
});

/**
 * Body schema: validates sort_order when setting primary image
 */
const setPrimarySchema = Joi.object({
  sort_order: Joi.number().integer().min(0).required().messages({
    'any.required': 'sort_order is required',
    'number.base': 'sort_order must be a number',
    'number.integer': 'sort_order must be an integer',
    'number.min': 'sort_order must be at least 0',
  }),
});

module.exports = {
  productParamsSchema,
  imageParamsSchema,
  setPrimarySchema,
};
