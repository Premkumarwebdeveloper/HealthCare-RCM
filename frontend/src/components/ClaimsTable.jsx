import { useCallback, useRef, useState } from 'react';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside';
import { formatCurrency, formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';

const COLUMNS = [
  { key: 'claimNumber', label: 'Claim #', sortable: false },
  { key: 'patientName', label: 'Patient Name', sortable: true },
  { key: 'dob', label: 'DOB', sortable: true },
  { key: 'memberId', label: 'Member ID', sortable: true },
  { key: 'dos', label: 'DOS', sortable: true },
  { key: 'payer', label: 'Payer', sortable: true },
  { key: 'billedAmount', label: 'Billed Amount', sortable: true, num: true },
  { key: 'paidAmount', label: 'Paid Amount', sortable: true, num: true },
  { key: 'status', label: 'Claim Status', sortable: true },
  { key: 'actionCode', label: 'Action Code', sortable: true },
];

function RowMenu({ onView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);
  return (
    <div className="row-menu" ref={ref}>
      <button type="button" className="more-btn" aria-label="Row actions" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <ul className="menu menu-sm" role="menu">
          <li><button type="button" role="menuitem" onClick={() => { setOpen(false); onView(); }}>View details</button></li>
        </ul>
      )}
    </div>
  );
}

export default function ClaimsTable({ rows, loading, sort, onSort, selected, onToggleRow, onToggleAll, onOpen }) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  return (
    <div className={`table-scroll ${loading ? 'is-loading' : ''}`}>
      <table className="table claims-table">
        <thead>
          <tr>
            <th className="check-col"><input type="checkbox" aria-label="Select all rows" checked={allSelected} onChange={onToggleAll} /></th>
            {COLUMNS.map((c) => (
              <th key={c.key} className={c.num ? 'num' : ''} aria-sort={sort.sortBy === c.key ? (sort.sortDir === 'asc' ? 'ascending' : 'descending') : undefined}>
                {c.sortable ? (
                  <button type="button" className="sort-btn" onClick={() => onSort(c.key)}>
                    {c.label} <ArrowUpDown size={12} className={sort.sortBy === c.key ? 'sorted' : ''} />
                  </button>
                ) : c.label}
              </th>
            ))}
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={selected.has(r.id) ? 'selected' : ''}>
              <td className="check-col"><input type="checkbox" aria-label={`Select ${r.claimNumber}`} checked={selected.has(r.id)} onChange={() => onToggleRow(r.id)} /></td>
              <td><button type="button" className="link link-btn" onClick={() => onOpen(r.id)}>{r.claimNumber}</button></td>
              <td>{r.patientName}</td>
              <td>{formatDate(r.dob)}</td>
              <td>{r.memberId}</td>
              <td>{formatDate(r.dos)}</td>
              <td>{r.payer}</td>
              <td className="num">{formatCurrency(r.billedAmount)}</td>
              <td className="num">{formatCurrency(r.paidAmount)}</td>
              <td><StatusBadge status={r.status} /></td>
              <td>{r.actionCode}</td>
              <td className="action-col"><RowMenu onView={() => onOpen(r.id)} /></td>
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={COLUMNS.length + 2} className="empty">No claims match the current filters. Adjust the filters or clear them to see all claims.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
