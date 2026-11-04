const { query } = require('../config/db');

const kpis = async (days) => {
  const { rows } = await query(
    `SELECT
       COUNT(*) FILTER (WHERE cur) AS cur_total,
       COUNT(*) FILTER (WHERE cur AND status = 'Paid') AS cur_paid,
       COUNT(*) FILTER (WHERE cur AND status = 'Denied') AS cur_denied,
       COALESCE(SUM(billed_amount - paid_amount) FILTER (WHERE cur AND status <> 'Paid'), 0) AS cur_ar,
       COUNT(*) FILTER (WHERE prev) AS prev_total,
       COUNT(*) FILTER (WHERE prev AND status = 'Paid') AS prev_paid,
       COUNT(*) FILTER (WHERE prev AND status = 'Denied') AS prev_denied,
       COALESCE(SUM(billed_amount - paid_amount) FILTER (WHERE prev AND status <> 'Paid'), 0) AS prev_ar
     FROM (
       SELECT status, billed_amount, paid_amount,
         updated_at >= NOW() - make_interval(days => $1) AS cur,
         (updated_at < NOW() - make_interval(days => $1)
           AND updated_at >= NOW() - make_interval(days => $1 * 2)) AS prev
       FROM claims
     ) t`,
    [days],
  );
  return rows[0];
};

// In Process claims are reported as Pending on the dashboard.
const statusBreakdown = async (days) => {
  const { rows } = await query(
    `SELECT CASE WHEN status = 'In Process' THEN 'Pending' ELSE status END AS status,
            COUNT(*) AS count
     FROM claims WHERE updated_at >= NOW() - make_interval(days => $1) GROUP BY 1`,
    [days],
  );
  return rows;
};

const arAging = async (days) => {
  const { rows } = await query(
    `SELECT CASE
        WHEN CURRENT_DATE - dos <= 30 THEN '0-30 Days'
        WHEN CURRENT_DATE - dos <= 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - dos <= 90 THEN '61-90 Days'
        ELSE '> 90 Days' END AS bucket,
      SUM(billed_amount - paid_amount) AS amount
     FROM claims
     WHERE status <> 'Paid' AND updated_at >= NOW() - make_interval(days => $1)
     GROUP BY 1`,
    [days],
  );
  return rows;
};

module.exports = { kpis, statusBreakdown, arAging };
