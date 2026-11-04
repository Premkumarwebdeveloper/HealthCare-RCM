import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';

const COLORS = ['#1d78f2', '#5ab0f2', '#a66cf0', '#f78fb8'];

export default function ArAgingChart({ data }) {
  return (
    <div className="card chart-card">
      <h3>AR Aging</h3>
      <div className="bar-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e6ecf5" />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#40506e' }} />
            <YAxis tickFormatter={formatCurrencyCompact} tickLine={false} axisLine={false} width={52} tick={{ fontSize: 12, fill: '#40506e' }} />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={64} isAnimationActive={false}>
              {data.map((d, i) => <Cell key={d.bucket} fill={COLORS[i]} />)}
              <LabelList dataKey="amount" position="top" formatter={(v) => formatCurrency(v).replace(/\.00$/, '')} style={{ fontSize: 12, fontWeight: 600, fill: '#0f1f3d' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
