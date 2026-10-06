const Joi = require('joi');

const checkoutSchema = {
  body: Joi.object({
    shippingAddress: Joi.string().min(10).required().messages({
      'string.min': 'Shipping address must be at least 10 characters',
      'any.required': 'Shipping address is required',
    }),
  }),
};

const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'any.required': 'Order ID is required',
    'string.uuid': 'Order ID must be a valid UUID',
  }),
});

const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
  checkoutSchema,
  orderIdSchema,
  orderQuerySchema,
};
