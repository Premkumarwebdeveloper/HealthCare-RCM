const dashboardRepository = require('../repositories/dashboard.repository');
const claimsRepository = require('../repositories/claims.repository');

const round1 = (n) => Math.round(n * 10) / 10;
const pctChange = (cur, prev) => (prev === 0 ? null : round1(((cur - prev) / prev) * 100));
const BUCKETS = ['0-30 Days', '31-60 Days', '61-90 Days', '> 90 Days'];
const STATUSES = ['Paid', 'Denied', 'Pending'];

async function getDashboard(days) {
  const [k, breakdown, aging, recent] = await Promise.all([
    dashboardRepository.kpis(days),
    dashboardRepository.statusBreakdown(days),
    dashboardRepository.arAging(days),
    claimsRepository.findRecent(5),
  ]);

  const total = k.cur_total;
  const byStatus = Object.fromEntries(breakdown.map((r) => [r.status, r.count]));
  const agingByBucket = Object.fromEntries(aging.map((r) => [r.bucket, r.amount]));

  return {
    kpis: {
      totalClaims: { value: k.cur_total, change: pctChange(k.cur_total, k.prev_total) },
      paidClaims: { value: k.cur_paid, change: pctChange(k.cur_paid, k.prev_paid) },
      deniedClaims: { value: k.cur_denied, change: pctChange(k.cur_denied, k.prev_denied) },
      totalAr: { value: k.cur_ar, change: pctChange(k.cur_ar, k.prev_ar) },
    },
    claimsByStatus: {
      total,
      items: STATUSES.map((status) => {
        const count = byStatus[status] || 0;
        return { status, count, percent: total ? round1((count / total) * 100) : 0 };
      }),
    },
    arAging: BUCKETS.map((bucket) => ({ bucket, amount: agingByBucket[bucket] || 0 })),
    recentClaims: recent,
  };
}

module.exports = { getDashboard };
