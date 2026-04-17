import { Navigate, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <AppHeader />
        <main id="main-content" tabIndex="-1">
          <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
            <p>Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
