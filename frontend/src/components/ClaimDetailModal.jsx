import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { claimsApi } from '../api/services';
import useAsync from '../hooks/useAsync';
import { formatCurrency, formatDate } from '../utils/format';
import Spinner from './Spinner';
import ErrorState from './ErrorState';
import StatusBadge from './StatusBadge';

export default function ClaimDetailModal({ claimId, onClose }) {
  const { data: c, loading, error, reload } = useAsync(() => claimsApi.get(claimId), [claimId]);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fields = c && [
    ['Patient', c.patientName], ['Date of birth', formatDate(c.dob)], ['Member ID', c.memberId],
    ['Date of service', formatDate(c.dos)], ['Payer', c.payer], ['Provider', c.providerName],
    ['Provider NPI', c.providerNpi], ['Billed amount', formatCurrency(c.billedAmount)],
    ['Paid amount', formatCurrency(c.paidAmount)], ['Action code', c.actionCode],
    ['Status code', `${c.statusCode} – ${c.statusDescription}`], ['Last updated', formatDate(c.updatedAt)],
  ];

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Claim details">
        <header className="modal-head">
          <div>
            <h2>{c ? c.claimNumber : 'Claim details'}</h2>
            {c && <StatusBadge status={c.status} />}
          </div>
          <button type="button" ref={closeRef} className="icon-btn" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </header>
        {loading && <Spinner />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {c && (
          <dl className="detail-grid">
            {fields.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
