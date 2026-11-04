import { useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle2, ChevronDown, ClipboardList, DollarSign } from 'lucide-react';
import { dashboardApi } from '../api/services';
import useAsync from '../hooks/useAsync';
import { formatCurrency, formatNumber } from '../utils/format';
import KpiCard from '../components/KpiCard';
import ClaimsByStatusChart from '../components/ClaimsByStatusChart';
import ArAgingChart from '../components/ArAgingChart';
import RecentClaimsTable from '../components/RecentClaimsTable';
import ClaimDetailModal from '../components/ClaimDetailModal';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';

const RANGES = [{ days: 7, label: 'Last 7 Days' }, { days: 30, label: 'Last 30 Days' }, { days: 90, label: 'Last 90 Days' }];

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const [openClaim, setOpenClaim] = useState(null);
  const { data, loading, error, reload } = useAsync(() => dashboardApi.get(days), [days]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">Revenue Cycle Overview</p>
        </div>
        <div className="range">
          <label htmlFor="range">Date Range</label>
          <span className="select-wrap select-range">
            <Calendar size={16} className="lead-icon" />
            <select id="range" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
            </select>
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {loading && !data && <Spinner />}
      {data && (
        <div className={loading ? 'is-loading' : ''}>
          <section className="kpi-grid">
            <KpiCard label="Total Claims" value={formatNumber(data.kpis.totalClaims.value)} change={data.kpis.totalClaims.change} icon={ClipboardList} tone="blue" />
            <KpiCard label="Paid Claims" value={formatNumber(data.kpis.paidClaims.value)} change={data.kpis.paidClaims.change} icon={CheckCircle2} tone="green" />
            <KpiCard label="Denied Claims" value={formatNumber(data.kpis.deniedClaims.value)} change={data.kpis.deniedClaims.change} icon={AlertTriangle} tone="red" increaseIsGood={false} />
            <KpiCard label="Total AR" value={formatCurrency(data.kpis.totalAr.value).replace(/\.00$/, '')} change={data.kpis.totalAr.change} icon={DollarSign} tone="green" increaseIsGood={false} />
          </section>
          <section className="chart-grid">
            <ClaimsByStatusChart data={data.claimsByStatus} />
            <ArAgingChart data={data.arAging} />
          </section>
          <RecentClaimsTable claims={data.recentClaims} onOpen={setOpenClaim} />
        </div>
      )}
      {openClaim && <ClaimDetailModal claimId={openClaim} onClose={() => setOpenClaim(null)} />}
    </>
  );
}
