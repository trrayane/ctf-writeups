import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import './Navbar.css';

const navItems = [
  { label: 'About', to: '/about' },
  { label: 'Science', to: '/science' },
  { label: 'Pipeline', to: '/pipeline' },
  { label: 'Team', to: '/team' },
  { label: 'Careers', to: '/careers' },
  { label: 'News', to: '/news' },
  { label: 'Contact', to: '/contact' },
] as const;

function Navbar() {
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const { pathname } = useLocation();
  const { user, isBootstrapping } = useAuth();
  const isOpen = openPathname === pathname;
  const closeMenu = () => setOpenPathname(null);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link
          className="navbar__brand"
          to="/"
          aria-label="NovaCrest Biosciences home"
          onClick={closeMenu}
        >
          <span className="navbar__brand-primary">NovaCrest</span>
          <span className="navbar__brand-secondary">Biosciences</span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() =>
            setOpenPathname((currentPathname) =>
              currentPathname === pathname ? null : pathname,
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__links ${isOpen ? 'is-open' : ''}`} aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {!isBootstrapping ? (
            <div className="navbar__actions">
              {user ? (
                <NavLink to="/dashboard" onClick={closeMenu} className="button button--filled navbar__action">
                  Open Panel
                </NavLink>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu} className="button button--outline navbar__action">
                    Login
                  </NavLink>
                  <NavLink to="/register" onClick={closeMenu} className="button button--filled navbar__action">
                    Signup
                  </NavLink>
                </>
              )}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
