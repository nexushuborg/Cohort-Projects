const Joi = require('joi');

/**
 * Params: validates :productId on variant routes
 */
const productParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
});

/**
 * Params: validates :productId and :variantTypeId
 */
const variantTypeParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
  variantTypeId: Joi.string().uuid().required().messages({
    'any.required': 'Variant Type ID is required',
    'string.uuid': 'Variant Type ID must be a valid UUID',
  }),
});

/**
 * Params: validates :productId, :variantTypeId, and :optionId
 */
const variantOptionParamsSchema = Joi.object({
  productId: Joi.string().uuid().required().messages({
    'any.required': 'Product ID is required',
    'string.uuid': 'Product ID must be a valid UUID',
  }),
  variantTypeId: Joi.string().uuid().required().messages({
    'any.required': 'Variant Type ID is required',
    'string.uuid': 'Variant Type ID must be a valid UUID',
  }),
  optionId: Joi.string().uuid().required().messages({
    'any.required': 'Option ID is required',
    'string.uuid': 'Option ID must be a valid UUID',
  }),
});

/**
 * Body: create a variant type
 */
const createVariantTypeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Variant type name must be at least 1 character',
    'string.max': 'Variant type name must not exceed 100 characters',
    'any.required': 'Variant type name is required',
  }),
});

/**
 * Body: update a variant type
 */
const updateVariantTypeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Variant type name must be at least 1 character',
    'string.max': 'Variant type name must not exceed 100 characters',
    'any.required': 'Variant type name is required',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Body: create a variant option
 */
const createVariantOptionSchema = Joi.object({
  value: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Option value must be at least 1 character',
    'string.max': 'Option value must not exceed 100 characters',
    'any.required': 'Option value is required',
  }),
});

/**
 * Body: update a variant option
 */
const updateVariantOptionSchema = Joi.object({
  value: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Option value must be at least 1 character',
    'string.max': 'Option value must not exceed 100 characters',
    'any.required': 'Option value is required',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = {
  productParamsSchema,
  variantTypeParamsSchema,
  variantOptionParamsSchema,
  createVariantTypeSchema,
  updateVariantTypeSchema,
  createVariantOptionSchema,
  updateVariantOptionSchema,
};
