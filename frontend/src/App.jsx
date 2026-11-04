import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Spinner from './components/Spinner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClaimsPage from './pages/ClaimsPage';
import ModulePage from './pages/ModulePage';
import NotFoundPage from './pages/NotFoundPage';

function RequireAuth() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Spinner label="Loading…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

const MODULES = [
  ['eligibility', 'Eligibility'], ['claim-status', 'Claim Status'], ['payments', 'Payments'],
  ['reports', 'Reports'], ['settings', 'Settings'],
];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="claims" element={<ClaimsPage key="claims" />} />
          <Route path="denials" element={<ClaimsPage key="denials" presetStatus="Denied" />} />
          {MODULES.map(([path, title]) => <Route key={path} path={path} element={<ModulePage title={title} />} />)}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
