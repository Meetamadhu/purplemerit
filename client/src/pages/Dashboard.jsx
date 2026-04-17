import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_COPY = {
  admin: 'You have full access to manage users and permissions.',
  manager: 'You can manage non-admin users and their details.',
  user: 'You can view and update your own profile.',
};

export default function Dashboard() {
  const { user, canManageUsers, isAdmin } = useAuth();
  const roleBlurb =
    ROLE_COPY[user.role] ||
    'You are signed in. Use the links below for the actions available to your account.';

  return (
    <div className="page-container side-bordered-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p className="text-muted">
            You are logged in as <strong>{user.role}</strong>.
          </p>
        </div>
      </div>

      {/* Role Info */}
        <div className="card" style={{borderLeft: '6px solid #1e8449'}}>
        <span className={`badge badge-${user.role}`}>{user.role}</span>

        <p className="text-muted" style={{ marginTop: '8px' }}>
          {roleBlurb}
        </p>
      </div>

      {/* Actions */}
      <div className="dashboard-grid">
        <div className="card action-card" style={{borderLeft: '6px solid #1e8449'}}>
            <h2>Profile</h2>
          <p className="text-muted">View and update your personal details and password.</p>
          <Link to="/profile" className="btn btn-primary">
            Open Profile
          </Link>
        </div>

        {canManageUsers && (
          <div className="card action-card" style={{borderLeft: '6px solid #1e8449'}}>
              <h2>{isAdmin ? 'Administration' : 'User Management'}</h2>
            <p className="text-muted">Manage users, roles, and permissions.</p>
            <Link to="/users" className="btn btn-dark">
              Manage Users
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
