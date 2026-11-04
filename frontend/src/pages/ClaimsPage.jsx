import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Hourglass, Home, RefreshCw, XCircle } from 'lucide-react';
import { lookupApi } from '../api/services';
import useAsync from '../hooks/useAsync';
import useClaims from '../hooks/useClaims';
import ClaimFilters from '../components/ClaimFilters';
import ClaimsTable from '../components/ClaimsTable';
import ClaimDetailModal from '../components/ClaimDetailModal';
import ExportMenu from '../components/ExportMenu';
import Pagination from '../components/Pagination';
import ErrorState from '../components/ErrorState';
import { formatNumber } from '../utils/format';

const CHIPS = [
  { status: 'Paid', icon: CheckCircle2, cls: 'chip-paid' },
  { status: 'Pending', icon: Hourglass, cls: 'chip-pending' },
  { status: 'Denied', icon: XCircle, cls: 'chip-denied' },
  { status: 'In Process', icon: RefreshCw, cls: 'chip-process' },
];

export default function ClaimsPage({ presetStatus = '' }) {
  const claims = useClaims(presetStatus);
  const { data: lookups } = useAsync(() => lookupApi.get(), []);
  const [openClaim, setOpenClaim] = useState(null);
  const title = presetStatus === 'Denied' ? 'Denials' : 'Claims Details';

  return (
    <>
      <div className="page-head page-head-crumb">
        <Link to="/" className="crumb-home" aria-label="Dashboard"><Home size={18} /></Link>
        <span className="crumb-sep">›</span>
        <div>
          <h1>{title}</h1>
          <p className="page-sub">View and manage claim information with patient details</p>
        </div>
      </div>

      <ClaimFilters draft={claims.draft} onChange={claims.updateDraft} onSearch={claims.applyFilters} onClear={claims.clearFilters} lookups={lookups} />

      <div className="summary-row">
        <h2 className="claims-count">Claims ({formatNumber(claims.meta?.total ?? 0)})</h2>
        <span className="divider" />
        <div className="chips">
          {CHIPS.map(({ status, icon: Icon, cls }) => (
            <button key={status} type="button" className={`chip ${cls} ${claims.applied.status === status ? 'active' : ''}`} onClick={() => claims.filterByStatus(status)} aria-pressed={claims.applied.status === status}>
              <Icon size={18} /> {status} <strong>{formatNumber(claims.statusCounts?.[status] ?? 0)}</strong>
            </button>
          ))}
        </div>
        <ExportMenu params={claims.params} selectedIds={[...claims.selected]} />
      </div>

      <div className="card table-card">
        {claims.error ? (
          <ErrorState message={claims.error} onRetry={claims.reload} />
        ) : (
          <>
            <ClaimsTable rows={claims.rows} loading={claims.loading} sort={claims.sort} onSort={claims.toggleSort} selected={claims.selected} onToggleRow={claims.toggleRow} onToggleAll={claims.toggleAll} onOpen={setOpenClaim} />
            <Pagination meta={claims.meta} onPage={claims.setPage} onPageSize={claims.changePageSize} />
          </>
        )}
      </div>
      {openClaim && <ClaimDetailModal claimId={openClaim} onClose={() => setOpenClaim(null)} />}
    </>
  );
}
