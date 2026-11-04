const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboard.service');
const lookupRepository = require('../repositories/lookup.repository');

const summary = asyncHandler(async (req, res) =>
  res.json(await dashboardService.getDashboard(req.query.days)),
);
const lookups = asyncHandler(async (_req, res) => res.json(await lookupRepository.all()));

module.exports = { summary, lookups };
