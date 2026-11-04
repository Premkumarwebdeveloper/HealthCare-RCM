const { query } = require('../config/db');

const SORT_COLUMNS = {
  claimNumber: ['c.claim_number'],
  patientName: ['pt.last_name', 'pt.first_name'],
  dob: ['pt.dob'],
  memberId: ['pt.member_id'],
  dos: ['c.dos'],
  payer: ['py.name'],
  billedAmount: ['c.billed_amount'],
  paidAmount: ['c.paid_amount'],
  status: ['c.status'],
  actionCode: ['ac.label'],
};

const FROM = `FROM claims c
  JOIN patients pt ON pt.id = c.patient_id
  JOIN payers py ON py.id = c.payer_id
  JOIN providers pr ON pr.id = c.provider_id
  JOIN action_codes ac ON ac.code = c.action_code
  JOIN status_codes sc ON sc.code = c.status_code`;

const SELECT = `SELECT c.id, c.claim_number AS "claimNumber",
  pt.first_name || ' ' || pt.last_name AS "patientName", pt.dob, pt.member_id AS "memberId",
  c.dos, py.name AS payer, c.billed_amount AS "billedAmount", c.paid_amount AS "paidAmount",
  c.status, ac.code AS "actionCodeId", ac.label AS "actionCode", sc.code AS "statusCode",
  sc.description AS "statusDescription", pr.npi AS "providerNpi", pr.name AS "providerName",
  c.updated_at AS "updatedAt"`;

function buildWhere(filters, { skipStatus = false } = {}) {
  const conditions = [];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    conditions.push(sql.replace('?', `$${params.length}`));
  };
  if (filters.patientName) add(`(pt.first_name || ' ' || pt.last_name) ILIKE ?`, `%${filters.patientName}%`);
  if (filters.claimNumber) add('c.claim_number ILIKE ?', `%${filters.claimNumber}%`);
  if (filters.dosFrom) add('c.dos >= ?', filters.dosFrom);
  if (filters.dosTo) add('c.dos <= ?', filters.dosTo);
  if (filters.payerId) add('c.payer_id = ?', filters.payerId);
  if (filters.status && !skipStatus) add('c.status = ?', filters.status);
  if (filters.actionCode) add('c.action_code = ?', filters.actionCode);
  if (filters.statusCode) add('c.status_code = ?', filters.statusCode);
  if (filters.providerNpi) add('pr.npi LIKE ?', `${filters.providerNpi}%`);
  if (filters.ids) add('c.id = ANY(?::int[])', filters.ids);
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

const orderBy = (sortBy, sortDir) => {
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const cols = SORT_COLUMNS[sortBy] || SORT_COLUMNS.dos;
  return `ORDER BY ${cols.map((c) => `${c} ${dir}`).join(', ')}, c.id DESC`;
};

async function list(filters, { page, pageSize, sortBy, sortDir }) {
  const { where, params } = buildWhere(filters);
  const chips = buildWhere(filters, { skipStatus: true });
  const offset = (page - 1) * pageSize;

  const [rows, count, statusRows] = await Promise.all([
    query(
      `${SELECT} ${FROM} ${where} ${orderBy(sortBy, sortDir)} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset],
    ),
    query(`SELECT COUNT(*) AS total ${FROM} ${where}`, params),
    query(`SELECT c.status, COUNT(*) AS count ${FROM} ${chips.where} GROUP BY c.status`, chips.params),
  ]);

  const statusCounts = { Paid: 0, Pending: 0, Denied: 0, 'In Process': 0 };
  statusRows.rows.forEach((r) => {
    statusCounts[r.status] = r.count;
  });
  return { rows: rows.rows, total: count.rows[0].total, statusCounts };
}

async function findAll(filters, { sortBy = 'dos', sortDir = 'desc' } = {}, limit = 10000) {
  const { where, params } = buildWhere(filters);
  const { rows } = await query(
    `${SELECT} ${FROM} ${where} ${orderBy(sortBy, sortDir)} LIMIT $${params.length + 1}`,
    [...params, limit],
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query(`${SELECT} ${FROM} WHERE c.id = $1`, [id]);
  return rows[0] || null;
}

const findRecent = async (limit = 5) => {
  const { rows } = await query(`${SELECT} ${FROM} ORDER BY c.updated_at DESC, c.id DESC LIMIT $1`, [limit]);
  return rows;
};

module.exports = { list, findAll, findById, findRecent };
