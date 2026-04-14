import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function AuditBlock({ label, refUser, at }) {
  if (!refUser && !at) return null;
  return (
    <p className="muted">
      <strong>{label}:</strong>{' '}
      {refUser ? (
        <>
          {refUser.name} ({refUser.email})
        </>
      ) : (
        '—'
      )}
      {at && (
        <>
          {' '}
          · {new Date(at).toLocaleString()}
        </>
      )}
    </p>
  );
}

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/users/${id}`);
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const deactivate = async () => {
    if (!window.confirm('Deactivate this user? They will not be able to sign in.')) return;
    setActionMsg('');
    try {
      await api.patch(`/api/users/${id}/deactivate`);
      setActionMsg('User deactivated.');
      await load();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="card"><p>Loading…</p></div>;
  if (error || !user) {
    return (
      <div className="card">
        <div className="error-banner">{error || 'Not found'}</div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  const uid = user._id || user.id;
  const isSelf = me.id === uid || me.id === user._id?.toString();

  return (
    <div className="card">
      <h1>{user.name}</h1>
      {actionMsg && <div className="success-banner">{actionMsg}</div>}
      <p>
        <span className={`badge badge-${user.role}`}>{user.role}</span>{' '}
        <span className={`badge badge-${user.status}`}>{user.status}</span>
      </p>
      <p>{user.email}</p>

      <h2 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>Audit</h2>
      <AuditBlock label="Created by" refUser={user.createdBy} at={user.createdAt} />
      <AuditBlock label="Last updated by" refUser={user.updatedBy} at={user.updatedAt} />

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {(isSelf || isAdmin || (me.role === 'manager' && user.role !== 'admin')) && (
          <Link to={`/users/${uid}/edit`} className="btn btn-primary" style={{ display: 'inline-block' }}>
            Edit
          </Link>
        )}
        {isAdmin && user.status === 'active' && !isSelf && (
          <button type="button" className="btn btn-danger" onClick={deactivate}>
            Deactivate
          </button>
        )}
        <Link to="/users" className="btn btn-secondary" style={{ display: 'inline-block' }}>
          Back to list
        </Link>
      </div>
    </div>
  );
}
