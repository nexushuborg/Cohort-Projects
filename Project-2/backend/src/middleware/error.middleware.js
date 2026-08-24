module.exports = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred on the server';

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Include validation details if present
  if (err.details) {
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
};
