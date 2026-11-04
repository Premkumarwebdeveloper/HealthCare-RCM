const AppError = require('../utils/AppError');
const claimsRepository = require('../repositories/claims.repository');

const FILTER_KEYS = [
  'patientName', 'claimNumber', 'dosFrom', 'dosTo', 'payerId', 'status',
  'actionCode', 'statusCode', 'providerNpi', 'ids',
];
const pickFilters = (query) => Object.fromEntries(FILTER_KEYS.map((k) => [k, query[k]]));

async function listClaims(query) {
  const { page, pageSize, sortBy, sortDir } = query;
  const { rows, total, statusCounts } = await claimsRepository.list(pickFilters(query), {
    page, pageSize, sortBy, sortDir,
  });
  return {
    data: rows,
    statusCounts,
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

async function getClaim(id) {
  const claim = await claimsRepository.findById(id);
  if (!claim) throw new AppError('Claim not found', 404);
  return claim;
}

const getExportRows = (query) => claimsRepository.findAll(pickFilters(query));

module.exports = { listClaims, getClaim, getExportRows };
