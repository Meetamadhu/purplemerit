import { Navigate, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <main>
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
