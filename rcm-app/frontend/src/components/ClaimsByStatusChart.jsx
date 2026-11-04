import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../utils/format';

const COLORS = { Paid: '#1d78f2', Denied: '#a66cf0', Pending: '#9fd0f7' };

export default function ClaimsByStatusChart({ data }) {
  return (
    <div className="card chart-card">
      <h3>Claims by Status</h3>
      <div className="donut-layout">
        <div className="donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.items} dataKey="count" nameKey="status" innerRadius="68%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
                {data.items.map((i) => <Cell key={i.status} fill={COLORS[i.status]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{formatNumber(data.total)}</strong>
            <span>Claims</span>
          </div>
        </div>
        <ul className="legend">
          {data.items.map((i) => (
            <li key={i.status}>
              <span className="dot" style={{ background: COLORS[i.status] }} />
              <span className="legend-name">{i.status} ({i.percent}%)</span>
              <span className="legend-count">{formatNumber(i.count)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
