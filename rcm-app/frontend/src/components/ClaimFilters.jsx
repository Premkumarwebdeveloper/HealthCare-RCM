import { Calendar, ChevronDown, RefreshCw, Search } from 'lucide-react';

function Select({ id, value, onChange, children }) {
  return (
    <span className="select-wrap">
      <select id={id} value={value} onChange={onChange}>{children}</select>
      <ChevronDown size={16} />
    </span>
  );
}

function SearchInput({ id, value, onChange, placeholder, inputMode }) {
  return (
    <span className="input-wrap">
      <Search size={16} />
      <input id={id} type="text" inputMode={inputMode} value={value} onChange={onChange} placeholder={placeholder} />
    </span>
  );
}

export default function ClaimFilters({ draft, onChange, onSearch, onClear, lookups, error }) {
  const set = (field) => (e) => onChange(field, e.target.value);
  const submit = (e) => {
    e.preventDefault();
    onSearch();
  };
  return (
    <form className="card filters" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="f-patient">Patient Name</label>
        <SearchInput id="f-patient" value={draft.patientName} onChange={set('patientName')} placeholder="Search by patient name" /></div>
      <div className="field"><label htmlFor="f-claim">Claim Number</label>
        <SearchInput id="f-claim" value={draft.claimNumber} onChange={set('claimNumber')} placeholder="Search by claim number" /></div>
      <div className="field"><label htmlFor="f-from">DOS From</label>
        <span className="input-wrap date"><Calendar size={16} /><input id="f-from" type="date" value={draft.dosFrom} max={draft.dosTo || undefined} onChange={set('dosFrom')} /></span></div>
      <div className="field"><label htmlFor="f-to">DOS To</label>
        <span className="input-wrap date"><Calendar size={16} /><input id="f-to" type="date" value={draft.dosTo} min={draft.dosFrom || undefined} onChange={set('dosTo')} /></span></div>
      <div className="field"><label htmlFor="f-payer">Payer</label>
        <Select id="f-payer" value={draft.payerId} onChange={set('payerId')}>
          <option value="">All Payers</option>
          {lookups?.payers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select></div>

      <div className="field"><label htmlFor="f-status">Claim Status</label>
        <Select id="f-status" value={draft.status} onChange={set('status')}>
          <option value="">All Status</option>
          {['Paid', 'Pending', 'Denied', 'In Process'].map((s) => <option key={s}>{s}</option>)}
        </Select></div>
      <div className="field"><label htmlFor="f-action">Action Code</label>
        <Select id="f-action" value={draft.actionCode} onChange={set('actionCode')}>
          <option value="">All Action Codes</option>
          {lookups?.actionCodes.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
        </Select></div>
      <div className="field"><label htmlFor="f-scode">Status Code</label>
        <Select id="f-scode" value={draft.statusCode} onChange={set('statusCode')}>
          <option value="">All Status Codes</option>
          {lookups?.statusCodes.map((s) => <option key={s.code} value={s.code}>{s.code} – {s.description}</option>)}
        </Select></div>
      <div className="field field-npi"><label htmlFor="f-npi">Provider NPI</label>
        <SearchInput id="f-npi" inputMode="numeric" value={draft.providerNpi} onChange={(e) => onChange('providerNpi', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Search by NPI" /></div>
      <div className="filter-actions">
        <button type="submit" className="btn btn-primary"><Search size={16} /> Search</button>
        <button type="button" className="btn btn-outline" onClick={onClear}><RefreshCw size={16} /> Clear</button>
      </div>
      {error && <p className="form-error filters-error" role="alert">{error}</p>}
    </form>
  );
}
