const asyncHandler = require('../utils/asyncHandler');
const claimsService = require('../services/claims.service');
const exportService = require('../services/export.service');

const list = asyncHandler(async (req, res) => res.json(await claimsService.listClaims(req.query)));
const getOne = asyncHandler(async (req, res) =>
  res.json({ data: await claimsService.getClaim(req.params.id) }),
);

const exportClaims = asyncHandler(async (req, res) => {
  const rows = await claimsService.getExportRows(req.query);
  const file = await exportService.build(req.query.format, rows);
  res
    .set({
      'Content-Type': file.type,
      'Content-Disposition': `attachment; filename="claims.${file.ext}"`,
    })
    .send(file.buffer);
});

module.exports = { list, getOne, exportClaims };
