const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const authenticate = (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new AppError('Authentication required', 401));
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};

const authorize =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user?.role) ? next() : next(new AppError('Forbidden', 403));

module.exports = { authenticate, authorize };
