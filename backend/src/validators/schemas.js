const { z } = require('zod');

const blankToUndefined = z.literal('').transform(() => undefined);
const optionalText = z.string().trim().max(100).optional().transform((v) => v || undefined);
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .optional()
  .or(blankToUndefined);

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(128),
  rememberMe: z.boolean().optional().default(false),
});

const STATUSES = ['Paid', 'Pending', 'Denied', 'In Process'];

const claimFilters = {
  patientName: optionalText,
  claimNumber: optionalText,
  dosFrom: isoDate,
  dosTo: isoDate,
  payerId: z.coerce.number().int().positive().optional().or(blankToUndefined),
  status: z.enum(STATUSES).optional().or(blankToUndefined),
  actionCode: optionalText,
  statusCode: optionalText,
  providerNpi: z
    .string()
    .trim()
    .regex(/^\d{1,10}$/, 'NPI must be numeric')
    .optional()
    .or(blankToUndefined),
  ids: z
    .string()
    .regex(/^\d+(,\d+)*$/, 'ids must be comma separated numbers')
    .optional()
    .transform((v) => (v ? v.split(',').map(Number) : undefined)),
};

const dateOrder = (v, ctx) => {
  if (v.dosFrom && v.dosTo && v.dosFrom > v.dosTo) {
    ctx.addIssue({ code: 'custom', path: ['dosTo'], message: 'DOS To must be on or after DOS From' });
  }
};

const claimListQuery = z
  .object({
    ...claimFilters,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce
      .number()
      .int()
      .refine((n) => [10, 25, 50, 100].includes(n), 'Invalid page size')
      .default(10),
    sortBy: z
      .enum(['claimNumber', 'patientName', 'dob', 'memberId', 'dos', 'payer', 'billedAmount', 'paidAmount', 'status', 'actionCode'])
      .default('dos'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
  })
  .superRefine(dateOrder);

const claimExportQuery = z
  .object({ ...claimFilters, format: z.enum(['csv', 'xlsx', 'pdf']) })
  .superRefine(dateOrder);

const idParam = z.object({ id: z.coerce.number().int().positive() });
const dashboardQuery = z.object({
  days: z.coerce
    .number()
    .int()
    .refine((n) => [7, 30, 90].includes(n), 'days must be 7, 30 or 90')
    .default(30),
});

module.exports = { loginSchema, claimListQuery, claimExportQuery, idParam, dashboardQuery };
