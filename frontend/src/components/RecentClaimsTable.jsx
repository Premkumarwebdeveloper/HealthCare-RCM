import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';

export default function RecentClaimsTable({ claims, onOpen }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Recent Claims</h3>
        <Link to="/claims" className="link">View All</Link>
      </div>
      <div className="table-scroll">
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Claim #</th><th>Patient Name</th><th>DOS</th><th>Payer</th>
              <th className="num">Billed Amount</th><th>Status</th><th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id}>
                <td><button type="button" className="link link-btn" onClick={() => onOpen(c.id)}>{c.claimNumber}</button></td>
                <td>{c.patientName}</td>
                <td>{formatDate(c.dos)}</td>
                <td>{c.payer}</td>
                <td className="num">{formatCurrency(c.billedAmount)}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>{formatDate(c.updatedAt)}</td>
              </tr>
            ))}
            {claims.length === 0 && <tr><td colSpan={7} className="empty">No claims found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
