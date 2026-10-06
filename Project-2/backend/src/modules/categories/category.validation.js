const Joi = require('joi');

const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name cannot exceed 100 characters',
      'any.required': 'Category name is required',
    }),
    parentId: Joi.string().guid({ version: ['uuidv4', 'uuidv5', 'uuidv1', 'uuidv7'] }).allow(null).optional().messages({
      'string.guid': 'Parent ID must be a valid UUID',
    }),
    slug: Joi.string().optional(),
  }),
};

const updateCategorySchema = {
  params: Joi.object({
    id: Joi.string().guid({ version: ['uuidv4', 'uuidv5', 'uuidv1', 'uuidv7'] }).required().messages({
      'string.guid': 'Category ID must be a valid UUID',
      'any.required': 'Category ID is required',
    }),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    parentId: Joi.string().guid({ version: ['uuidv4', 'uuidv5', 'uuidv1', 'uuidv7'] }).allow(null).optional(),
    slug: Joi.string().optional(),
  }),
};

const categoryIdSchema = {
  params: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'Category ID is required',
    }),
  }),
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
};
