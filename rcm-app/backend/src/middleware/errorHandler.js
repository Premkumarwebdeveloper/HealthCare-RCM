const { ZodError } = require('zod');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const notFound = (req, _res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err.code === '23505') return res.status(409).json({ message: 'Resource already exists' });
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, errors: err.details });
  }
  console.error(err);
  return res.status(500).json({
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

module.exports = { notFound, errorHandler };
