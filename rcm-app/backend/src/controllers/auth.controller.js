const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => res.json(await authService.login(req.body)));
const me = asyncHandler(async (req, res) =>
  res.json({ user: await authService.getProfile(req.user.sub) }),
);

module.exports = { login, me };
