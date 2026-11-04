const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const authController = require('../controllers/auth.controller');
const claimsController = require('../controllers/claims.controller');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again later.' },
});

router.post('/auth/login', loginLimiter, validate(schemas.loginSchema), authController.login);
router.get('/auth/me', authenticate, authController.me);

router.use(authenticate, authorize('admin', 'biller'));
router.get('/lookups', dashboardController.lookups);
router.get('/dashboard', validate(schemas.dashboardQuery, 'query'), dashboardController.summary);
router.get('/claims', validate(schemas.claimListQuery, 'query'), claimsController.list);
router.get('/claims/export', validate(schemas.claimExportQuery, 'query'), claimsController.exportClaims);
router.get('/claims/:id', validate(schemas.idParam, 'params'), claimsController.getOne);

module.exports = router;
