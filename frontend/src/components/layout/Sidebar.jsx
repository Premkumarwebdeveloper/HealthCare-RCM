import { NavLink } from 'react-router-dom';
import { AlertTriangle, BarChart3, CreditCard, FileText, Home, Search, Settings, ShieldCheck } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/eligibility', label: 'Eligibility', icon: ShieldCheck },
  { to: '/claim-status', label: 'Claim Status', icon: Search },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/denials', label: 'Denials', icon: AlertTriangle },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary">
      <nav>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
