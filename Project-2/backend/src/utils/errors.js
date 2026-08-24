function createAppError(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (details) err.details = details;
  return err;
}

function createValidationError(message = 'Invalid input data', details = null) {
  return createAppError(message, 400, 'VALIDATION_ERROR', details);
}

function createUnauthorizedError(message = 'Unauthorized') {
  return createAppError(message, 401, 'UNAUTHORIZED');
}

function createForbiddenError(message = 'Forbidden') {
  return createAppError(message, 403, 'FORBIDDEN');
}

function createNotFoundError(message = 'Not found') {
  return createAppError(message, 404, 'NOT_FOUND');
}

function createConflictError(message = 'Resource already exists') {
  return createAppError(message, 409, 'CONFLICT');
}

module.exports = {
  createAppError,
  createValidationError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
};
