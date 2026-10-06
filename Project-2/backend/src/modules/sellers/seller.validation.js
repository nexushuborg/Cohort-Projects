const Joi = require('joi');

const registerStoreSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Store name must be at least 2 characters',
      'string.max': 'Store name cannot exceed 255 characters',
      'any.required': 'Store name is required',
    }),
    description: Joi.string().allow('', null).optional(),
    contactEmail: Joi.string().email().allow('', null).optional(),
    contactPhone: Joi.string().allow('', null).optional(),
    logoUrl: Joi.string().uri().allow('', null).optional(),
    bannerUrl: Joi.string().uri().allow('', null).optional(),
    policies: Joi.string().allow('', null).optional(),
  }),
};

const updateStoreSchema = {
  params: Joi.object({
    id: Joi.string().guid({ version: ['uuidv4', 'uuidv5', 'uuidv1', 'uuidv7'] }).required().messages({
      'string.guid': 'Store ID must be a valid UUID',
      'any.required': 'Store ID is required',
    }),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().allow('', null).optional(),
    contactEmail: Joi.string().email().allow('', null).optional(),
    contactPhone: Joi.string().allow('', null).optional(),
    logoUrl: Joi.string().uri().allow('', null).optional(),
    bannerUrl: Joi.string().uri().allow('', null).optional(),
    policies: Joi.string().allow('', null).optional(),
  }),
};

const updateStoreStatusSchema = {
  params: Joi.object({
    id: Joi.string().guid({ version: ['uuidv4', 'uuidv5', 'uuidv1', 'uuidv7'] }).required().messages({
      'string.guid': 'Store ID must be a valid UUID',
      'any.required': 'Store ID is required',
    }),
  }),
  body: Joi.object({
    status: Joi.string().valid('pending', 'active', 'suspended').required().messages({
      'any.only': 'Status must be one of: pending, active, suspended',
      'any.required': 'Status is required',
    }),
  }),
};

const storeQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('pending', 'active', 'suspended').optional(),
    search: Joi.string().allow('', null).optional(),
  }),
};

module.exports = {
  registerStoreSchema,
  updateStoreSchema,
  updateStoreStatusSchema,
  storeQuerySchema,
};
