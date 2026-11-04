const CLASS_BY_STATUS = {
  Paid: 'badge-paid',
  Pending: 'badge-pending',
  Denied: 'badge-denied',
  'In Process': 'badge-process',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${CLASS_BY_STATUS[status] || ''}`}>{status}</span>;
}
