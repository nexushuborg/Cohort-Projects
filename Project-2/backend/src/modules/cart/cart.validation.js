const Joi = require('joi');

const addItemSchema = Joi.object({
  skuId: Joi.string().uuid().required().messages({
    'any.required': 'SKU ID is required',
    'string.uuid': 'SKU ID must be a valid UUID',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
});

const cartItemParamsSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'any.required': 'Cart item ID is required',
    'string.uuid': 'Cart item ID must be a valid UUID',
  }),
});

module.exports = {
  addItemSchema,
  updateItemSchema,
  cartItemParamsSchema,
};
