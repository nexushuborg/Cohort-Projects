function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function sendPaginated(res, items = [], pagination = {}, statusCode = 200) {
  const { page = 1, limit = 20, total = 0 } = pagination;
  const totalPages = Math.ceil(total / limit) || 1;

  return res.status(statusCode).json({
    success: true,
    data: {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages,
      },
    },
  });
}

function sendError(res, error = {}, statusCode = 500) {
  const {
    code = 'INTERNAL_ERROR',
    message = 'An unexpected error occurred',
    details = null,
  } = error;

  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details && details.length > 0) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
};
