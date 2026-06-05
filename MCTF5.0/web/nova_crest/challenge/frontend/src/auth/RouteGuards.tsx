import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { RoleCode } from '../types';

export function AuthGate() {
  const { isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="section">
        <div className="container">
          <div className="page-card">Loading session...</div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export function RequireAuth() {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="section">
        <div className="container">
          <div className="page-card">Loading session...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequireRole({ allowed }: { allowed: RoleCode[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.roleCode)) {
    if (user.roleCode === 'admin') return <Navigate to="/admin" replace />;
    if (user.roleCode === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
}
