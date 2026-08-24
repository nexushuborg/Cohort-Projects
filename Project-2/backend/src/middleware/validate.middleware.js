/**
 * Validation middleware factory.
 *
 * Supports three target sources:
 *   validate(schema)          — validates req.body (default, backward-compatible)
 *   validateParams(schema)    — validates req.params
 *   validateQuery(schema)     — validates req.query
 */

const createValidator = (source) => (schema) => (req, res, next) => {
  const { error } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      },
    });
  }
  next();
};

// Default: validates req.body (backward-compatible with existing usage)
const validate = createValidator('body');

// Params: validates req.params
const validateParams = createValidator('params');

// Query: validates req.query
const validateQuery = createValidator('query');

module.exports = validate;
module.exports.validate = validate;
module.exports.validateParams = validateParams;
module.exports.validateQuery = validateQuery;
