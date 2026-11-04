import { ArrowDown, ArrowUp } from 'lucide-react';

export default function KpiCard({ label, value, change, icon: Icon, tone, increaseIsGood = true }) {
  const hasChange = change !== null && change !== undefined;
  const up = hasChange && change >= 0;
  const good = hasChange && (up === increaseIsGood);
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <div className="card kpi">
      <span className={`kpi-icon tone-${tone}`}><Icon size={24} /></span>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className={`kpi-change ${hasChange ? (good ? 'good' : 'bad') : 'flat'}`}>
          {hasChange ? (<><Arrow size={14} strokeWidth={3} /> {up ? '+' : ''}{change}%</>) : 'No prior data'}
        </div>
      </div>
    </div>
  );
}
