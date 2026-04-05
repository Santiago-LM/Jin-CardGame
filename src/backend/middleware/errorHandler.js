/**
 * Global error handler
 */

const errorHandler = (error, req, res, next) => {
  console.error('[Error]', error.message);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = { errorHandler };