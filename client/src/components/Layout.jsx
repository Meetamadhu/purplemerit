import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkStyle = ({ isActive }) => ({
  fontWeight: isActive ? 700 : 500,
  textDecoration: isActive ? 'underline' : 'none',
});

export default function Layout() {
  const { user, logout, canManageUsers } = useAuth();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <span className="nav-brand">User Management</span>
        {user && (
          <nav className="nav-links">
            <NavLink to="/" end style={linkStyle}>
              Dashboard
            </NavLink>
            {canManageUsers && (
              <NavLink to="/users" style={linkStyle}>
                Users
              </NavLink>
            )}
            <NavLink to="/profile" style={linkStyle}>
              My profile
            </NavLink>
            <span className="muted">
              {user.name} ({user.role})
            </span>
            <Link to="/login" onClick={(e) => { e.preventDefault(); logout(); }}>
              Log out
            </Link>
          </nav>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
