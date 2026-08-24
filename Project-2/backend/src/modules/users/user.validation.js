const Joi = require('joi');

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    phone: Joi.string().allow('', null).optional(),
    avatar_url: Joi.string().uri().allow('', null).optional(),
  }),
};

const updatePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.pattern.base': 'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
        'any.required': 'New password is required',
      }),
  }),
};

const userQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    role: Joi.string().valid('admin', 'seller', 'buyer').optional(),
  }),
};

module.exports = {
  updateProfileSchema,
  updatePasswordSchema,
  userQuerySchema,
};
