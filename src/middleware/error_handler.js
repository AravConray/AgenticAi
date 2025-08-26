const handleError = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    error: message
  };

  if (!isProd) {
    response.stack = err.stack;
  }

  console.error(err);

  res.status(status).json(response);
};

module.exports = handleError;
