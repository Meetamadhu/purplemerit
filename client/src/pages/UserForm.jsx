import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function UserForm() {
  const { id } = useParams();
  const isCreate = !id;
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('active');
  const [password, setPassword] = useState('');
  const [autoPassword, setAutoPassword] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(!isCreate);

  useEffect(() => {
    if (isCreate) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/users/${id}`);
        if (cancelled) return;
        const u = data.user;
        setName(u.name);
        setEmail(u.email);
        setRole(u.role);
        setStatus(u.status);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isCreate]);

  const submitCreate = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedPassword('');
    try {
      const body = { name, email, role, status, autoPassword };
      if (!autoPassword) {
        if (!password) {
          setError('Password required unless auto-generate is checked');
          return;
        }
        body.password = password;
      }
      const { data } = await api.post('/api/users', body);
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      } else {
        navigate(`/users/${data.user._id || data.user.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { name, email, status };
      if (isAdmin) body.role = role;
      if (password) body.password = password;
      await api.patch(`/api/users/${id}`, body);
      navigate(`/users/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (!isCreate && loading) {
    return (
      <div className="card">
        <p>Loading…</p>
      </div>
    );
  }

  if (isCreate && !isAdmin) {
    return (
      <div className="card">
        <div className="error-banner">Only admins can create users.</div>
        <Link to="/users">Back</Link>
      </div>
    );
  }

  if (generatedPassword) {
    return (
      <div className="card">
        <h1>User created</h1>
        <p>Copy this temporary password and share it securely:</p>
        <p style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{generatedPassword}</p>
        <Link to="/users" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>{isCreate ? 'Create user' : 'Edit user'}</h1>
      {error && <div className="error-banner">{error}</div>}
      <form className="form-grid" onSubmit={isCreate ? submitCreate : submitUpdate}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {isAdmin && (
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        {isCreate && (
          <>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={autoPassword} onChange={(e) => setAutoPassword(e.target.checked)} />
              Auto-generate password
            </label>
            {!autoPassword && (
              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              </label>
            )}
          </>
        )}
        {!isCreate && (
          <label>
            New password (optional)
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            {isCreate ? 'Create' : 'Save'}
          </button>
          <Link to={isCreate ? '/users' : `/users/${id}`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
