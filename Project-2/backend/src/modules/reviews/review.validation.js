const Joi = require('joi');

const createProductReviewSchema = {
  params: Joi.object({
    productId: Joi.string().uuid().required().messages({
      'any.required': 'Product ID is required',
      'string.uuid': 'Product ID must be a valid UUID',
    }),
  }),
  body: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
    text: Joi.string().allow('', null).optional().max(2000).messages({
      'string.max': 'Review text cannot exceed 2000 characters',
    }),
  }),
};

const createStoreReviewSchema = {
  params: Joi.object({
    storeId: Joi.string().uuid().required().messages({
      'any.required': 'Store ID is required',
      'string.uuid': 'Store ID must be a valid UUID',
    }),
  }),
  body: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
    text: Joi.string().allow('', null).optional().max(2000).messages({
      'string.max': 'Review text cannot exceed 2000 characters',
    }),
  }),
};

const reviewIdSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'any.required': 'Review ID is required',
      'string.uuid': 'Review ID must be a valid UUID',
    }),
  }),
};

const productIdParamSchema = {
  params: Joi.object({
    productId: Joi.string().uuid().required().messages({
      'any.required': 'Product ID is required',
      'string.uuid': 'Product ID must be a valid UUID',
    }),
  }),
};

const storeIdParamSchema = {
  params: Joi.object({
    storeId: Joi.string().uuid().required().messages({
      'any.required': 'Store ID is required',
      'string.uuid': 'Store ID must be a valid UUID',
    }),
  }),
};

const reviewQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

module.exports = {
  createProductReviewSchema,
  createStoreReviewSchema,
  reviewIdSchema,
  productIdParamSchema,
  storeIdParamSchema,
  reviewQuerySchema,
};
