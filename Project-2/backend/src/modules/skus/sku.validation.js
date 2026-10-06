const Joi = require('joi');

const productParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
});

const skuParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
  skuId: Joi.string().uuid().required().messages({
    'any.required': 'SKU ID is required',
    'string.uuid': 'SKU ID must be a valid UUID',
  }),
});

const createSkuSchema = Joi.object({
  skuCode: Joi.string().min(1).max(100).required().messages({
    'string.min': 'SKU code must be at least 1 character',
    'string.max': 'SKU code must not exceed 100 characters',
    'any.required': 'SKU code is required',
  }),
  priceOverride: Joi.number().precision(2).min(0).allow(null).optional().messages({
    'number.min': 'Price override must be 0 or greater',
  }),
  status: Joi.string().valid('draft', 'active', 'inactive').optional(),
  variantOptionIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'At least one variant option ID is required',
    'any.required': 'Variant option IDs are required',
    'string.uuid': 'Each variant option ID must be a valid UUID',
  }),
});

const updateSkuSchema = Joi.object({
  skuCode: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'SKU code must be at least 1 character',
    'string.max': 'SKU code must not exceed 100 characters',
  }),
  priceOverride: Joi.number().precision(2).min(0).allow(null).optional().messages({
    'number.min': 'Price override must be 0 or greater',
  }),
  status: Joi.string().valid('draft', 'active', 'inactive').optional(),
  variantOptionIds: Joi.array().items(Joi.string().uuid()).min(1).optional().messages({
    'array.min': 'At least one variant option ID is required',
    'string.uuid': 'Each variant option ID must be a valid UUID',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = {
  productParamsSchema,
  skuParamsSchema,
  createSkuSchema,
  updateSkuSchema,
};
