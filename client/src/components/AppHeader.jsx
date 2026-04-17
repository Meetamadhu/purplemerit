import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function toneNav(tone, isActive) {
  return `nav-link nav-link--tone-${tone}${isActive ? ' nav-link-active' : ''}`;
}

/** Single top bar for app shell: loading, guest (brand + Sign in), or full authenticated nav. */
export default function AppHeader() {
  const { user, logout, canManageUsers, ready } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="top-nav" role="banner">
      <div className="nav-header-inner">
        <Link to="/" className="nav-brand">
          User Management
        </Link>
        {!ready ? (
          <div className="nav-links nav-links-center muted" aria-live="polite">
            Loading…
          </div>
        ) : user ? (
          <>
            <nav className="nav-links nav-links-center" aria-label="Primary">
              <NavLink to="/" end className={({ isActive }) => toneNav('dash', isActive)}>
                Dashboard
              </NavLink>
              {canManageUsers && (
                <NavLink to="/users" className={({ isActive }) => toneNav('users', isActive)}>
                  Users
                </NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => toneNav('profile', isActive)}>
                My profile
              </NavLink>
            </nav>
            <div className="nav-user-block">
              <span className="nav-user-meta">
                {user.name} ({user.role})
              </span>
              <button
                type="button"
                className="nav-link nav-link--tone-logout"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="nav-header-filler" aria-hidden="true" />
            <div className="nav-user-block nav-user-block--guest">
              <NavLink to="/login" className={({ isActive }) => toneNav('signin', isActive)}>
                Sign in
              </NavLink>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
