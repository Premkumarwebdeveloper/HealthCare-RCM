import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="app-shell">
      <Topbar onMenu={() => setNavOpen((o) => !o)} />
      <div className="app-body">
        <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
        {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
