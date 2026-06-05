import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './InternalLayout.css';

const portalLinks = [
  { label: 'Overview', to: '/portal' },
  { label: 'Profile', to: '/portal/profile' },
  { label: 'Applications', to: '/portal/applications' },
  { label: 'Inquiries', to: '/portal/inquiries' },
] as const;

const staffLinks = [
  { label: 'Overview', to: '/staff' },
  { label: 'Articles', to: '/staff/articles' },
  { label: 'Pipeline Programs', to: '/staff/pipeline-programs' },
  { label: 'Team Profiles', to: '/staff/team-profiles' },
  { label: 'Job Postings', to: '/staff/job-postings' },
] as const;

const adminLinks = [
  { label: 'Overview', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Roles', to: '/admin/roles' },
  { label: 'Sessions', to: '/admin/sessions' },
  { label: 'Articles', to: '/admin/articles' },
  { label: 'Pipeline Programs', to: '/admin/pipeline-programs' },
  { label: 'Team Profiles', to: '/admin/team-profiles' },
  { label: 'Job Postings', to: '/admin/job-postings' },
  { label: 'Job Applications', to: '/admin/job-applications' },
  { label: 'Inquiries', to: '/admin/inquiries' },
  { label: 'Audit Logs', to: '/admin/audit-logs' },
  { label: 'Error Logs', to: '/admin/error-logs' },
  { label: 'QMongo', to: '/admin/qmongo' },
] as const;

export default function InternalLayout() {
  const { user, logout } = useAuth();

  const links =
    user?.roleCode === 'admin' ? adminLinks : user?.roleCode === 'staff' ? staffLinks : portalLinks;

  return (
    <div className="internal-shell">
      <aside className="internal-sidebar">
        <div className="internal-brand">
          <span className="internal-brand__main">NovaCrest</span>
          <span className="internal-brand__sub">Operations</span>
        </div>
        <nav className="internal-nav" aria-label="Dashboard navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `internal-nav__link${isActive ? ' internal-nav__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="internal-content">
        <header className="internal-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>
              Signed in as {user?.fullName} ({user?.roleCode})
            </p>
          </div>
          <div className="internal-topbar__actions">
            <NavLink to="/" className="button button--outline">
              Public Site
            </NavLink>
            <button type="button" className="button button--filled" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </header>
        <div className="internal-body">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
