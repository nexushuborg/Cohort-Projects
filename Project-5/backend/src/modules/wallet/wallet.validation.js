const Joi = require('joi');

const topUpSchema = Joi.object({
  amount: Joi.number().positive().min(1).max(50000).required().messages({
    'number.min': 'Minimum top-up amount is ₹1',
    'number.max': 'Maximum single top-up limit is ₹50,000'
  }),
  referenceId: Joi.string().optional().allow('')
});

module.exports = {
  topUpSchema
};