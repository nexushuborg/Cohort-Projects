const Joi = require('joi');

const productParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
});

const inventoryParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
  skuId: Joi.string().uuid().required().messages({
    'any.required': 'SKU ID is required',
    'string.uuid': 'SKU ID must be a valid UUID',
  }),
});

const setStockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity cannot be negative',
    'any.required': 'Quantity is required',
  }),
});

const adjustStockSchema = Joi.object({
  quantity: Joi.number().integer().required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'any.required': 'Quantity is required',
  }),
});

module.exports = {
  productParamsSchema,
  inventoryParamsSchema,
  setStockSchema,
  adjustStockSchema,
};
