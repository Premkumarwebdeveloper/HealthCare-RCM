import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPageList } from '../utils/format';

export default function Pagination({ meta, onPage, onPageSize }) {
  if (!meta) return null;
  const { page, pageSize, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const go = (p) => p >= 1 && p <= totalPages && p !== page && onPage(p);

  return (
    <div className="pagination-bar">
      <span className="muted-strong">
        Showing {from} – {to} of {total.toLocaleString('en-US')} claims
      </span>
      <div className="pagination-right">
        <label className="rows-per-page">
          Rows per page:
          <span className="select-wrap select-sm">
            <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </span>
        </label>
        <nav className="pager" aria-label="Pagination">
          <button type="button" aria-label="First page" disabled={page === 1} onClick={() => go(1)}><ChevronsLeft size={16} /></button>
          <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => go(page - 1)}><ChevronLeft size={16} /></button>
          {getPageList(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="pager-gap">…</span>
            ) : (
              <button key={p} type="button" className={p === page ? 'active' : ''} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)}>{p}</button>
            ),
          )}
          <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => go(page + 1)}><ChevronRight size={16} /></button>
          <button type="button" aria-label="Last page" disabled={page === totalPages} onClick={() => go(totalPages)}><ChevronsRight size={16} /></button>
        </nav>
      </div>
    </div>
  );
}
