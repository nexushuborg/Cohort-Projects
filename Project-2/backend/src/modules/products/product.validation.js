const Joi = require('joi');

const createProductSchema = Joi.object({
  storeId: Joi.string().uuid().required().messages({
    'any.required': 'Store ID is required',
    'string.uuid': 'Store ID must be a valid UUID',
  }),
  categoryId: Joi.string().uuid().allow(null, '').optional(),
  name: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Product name must be at least 3 characters',
    'string.max': 'Product name must not exceed 255 characters',
    'any.required': 'Product name is required',
  }),
  slug: Joi.string().min(3).max(255).optional().messages({
    'string.min': 'Slug must be at least 3 characters',
    'string.max': 'Slug must not exceed 255 characters',
  }),
  description: Joi.string().max(5000).allow('', null).optional(),
  brand: Joi.string().max(255).allow('', null).optional(),
  price: Joi.number().precision(2).min(0.01).required().messages({
    'number.min': 'Price must be greater than 0',
    'any.required': 'Price is required',
  }),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
});

const updateProductSchema = Joi.object({
  categoryId: Joi.string().uuid().allow(null, '').optional(),
  name: Joi.string().min(3).max(255).optional(),
  slug: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(5000).allow('', null).optional(),
  brand: Joi.string().max(255).allow('', null).optional(),
  price: Joi.number().precision(2).min(0.01).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const storeProductsParamsSchema = Joi.object({
  storeId: Joi.string().uuid().required().messages({
    'any.required': 'Store ID is required',
    'string.uuid': 'Store ID must be a valid UUID',
  }),
});

const storeProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  storeProductsParamsSchema,
  storeProductsQuerySchema,
};
