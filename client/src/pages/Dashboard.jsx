import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, canManageUsers, isAdmin } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="card dashboard-card">
        <h1>Dashboard</h1>
        <p>
          Signed in as <strong>{user.name}</strong> ({user.role}).
        </p>
        <ul>
          <li>
            <Link to="/profile">View or edit your profile</Link>
          </li>
          {canManageUsers && (
            <li>
              <Link to="/users">{isAdmin ? 'Manage users' : 'View and update users'}</Link>
            </li>
          )}
        </ul>
        {!canManageUsers && (
          <p className="muted">Regular users can only access their own profile.</p>
        )}
      </div>
    </div>
  );
}
