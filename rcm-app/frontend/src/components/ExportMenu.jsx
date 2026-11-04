import { useCallback, useRef, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText, FileType } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside';
import { claimsApi } from '../api/services';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

const PAGING_KEYS = ['page', 'pageSize', 'sortBy', 'sortDir'];
const OPTIONS = [
  { format: 'xlsx', label: 'Export to Excel', icon: FileSpreadsheet, color: '#1d7a45' },
  { format: 'csv', label: 'Export to CSV', icon: FileText, color: '#3b4a6b' },
  { format: 'pdf', label: 'Export to PDF', icon: FileType, color: '#d93025' },
];

export default function ExportMenu({ params, selectedIds }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const { notify } = useToast();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const run = async (format) => {
    setOpen(false);
    setBusy(true);
    try {
      const query = Object.fromEntries(Object.entries(params).filter(([k]) => !PAGING_KEYS.includes(k)));
      query.format = format;
      if (selectedIds.length) query.ids = selectedIds.join(',');
      const res = await claimsApi.export(query);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claims.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify(`Claims exported to ${format.toUpperCase()}`);
    } catch (err) {
      notify(await getErrorMessage(err, 'Export failed.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="export-menu" ref={ref}>
      <button type="button" className="btn btn-export" onClick={() => setOpen((o) => !o)} disabled={busy} aria-haspopup="menu" aria-expanded={open}>
        <Download size={16} /> {busy ? 'Exporting…' : 'Export'} <ChevronDown size={15} />
      </button>
      {open && (
        <ul className="menu" role="menu">
          {OPTIONS.map(({ format, label, icon: Icon, color }) => (
            <li key={format}>
              <button type="button" role="menuitem" onClick={() => run(format)}>
                <Icon size={18} color={color} /> {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
