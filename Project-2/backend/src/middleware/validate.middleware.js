const { createValidationError } = require('../utils/errors');

// ─── Generic source validator factory ─────────────────────────
function createValidator(source) {
  return function (schema) {
    return function (req, res, next) {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message.replace(/['"]/g, ''),
        }));
        return next(createValidationError('Invalid input data', details));
      }

      req[source] = value;
      next();
    };
  };
}

// ─── Named validators (Person 2 uses these) ───────────────────
const validateBody = createValidator('body');
const validateParams = createValidator('params');
const validateQuery = createValidator('query');

// ─── Combined validator (Person 1 uses this) ──────────────────
function validate(schema) {
  // If schema has .validate method, treat as req.body validator
  if (schema && typeof schema.validate === 'function') {
    return validateBody(schema);
  }

  // If schema is an object with body/params/query keys
  return function validateHandler(req, res, next) {
    const locations = ['body', 'query', 'params'];
    const errors = [];

    for (const location of locations) {
      if (schema && schema[location] && typeof schema[location].validate === 'function') {
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

module.exports = validate;
module.exports.validate = validate;
module.exports.validateBody = validateBody;
module.exports.validateParams = validateParams;
module.exports.validateQuery = validateQuery;
