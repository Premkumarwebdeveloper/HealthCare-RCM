import { useCallback, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import Logo from '../Logo';
import { useAuth } from '../../context/AuthContext';
import useClickOutside from '../../hooks/useClickOutside';
import { initials } from '../../utils/format';

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  return (
    <header className="topbar">
      <button type="button" className="menu-toggle" aria-label="Toggle navigation" onClick={onMenu}><Menu size={22} /></button>
      <div className="brand"><Logo /> <span>HealthCare RCM</span></div>
      <div className="topbar-right">
        <button type="button" className="icon-btn bell" aria-label="Notifications"><Bell size={20} /><i className="bell-dot" /></button>
        <div className="user-menu" ref={ref}>
          <button type="button" className="user-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
            <span className="avatar">{initials(user?.fullName)}</span>
            <span className="user-name">{user?.fullName}</span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <ul className="menu menu-right" role="menu">
              <li><button type="button" role="menuitem" onClick={logout}><LogOut size={16} /> Sign out</button></li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
