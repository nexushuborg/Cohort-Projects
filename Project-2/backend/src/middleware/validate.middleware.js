const { createValidationError } = require('../utils/errors');

/**
 * Joi Schema Validation Middleware (Functional)
 */
function validate(schema) {
  return function validateHandler(req, res, next) {
    const locations = ['body', 'query', 'params'];
    const errors = [];

    for (const location of locations) {
      if (schema[location]) {
        const { error, value } = schema[location].validate(req[location], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: detail.path.join('.'),
              message: detail.message.replace(/['"]/g, ''),
            });
          });
        } else {
          // Replace with sanitized/stripped value
          req[location] = value;
        }
      }
    }

    if (errors.length > 0) {
      return next(createValidationError('Invalid input data', errors));
    }

    next();
  };
}

module.exports = {
  validate,
};
