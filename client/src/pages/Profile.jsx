import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, persistAuth, loadStoredAuth } from '../api/client.js';

export default function Profile() {
  const { user, refreshSession } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const body = { name };
      if (password) body.password = password;
      const { data } = await api.patch(`/api/users/${user.id}`, body);
      setMessage('Profile updated.');
      setPassword('');
      const stored = loadStoredAuth();
      if (stored) {
        persistAuth({ ...stored, user: data.user });
      }
      await refreshSession();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="card profile-card">
        <h1>My profile</h1>
        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner">{message}</div>}
        <p className="muted">
          Role: <strong>{user.role}</strong> (cannot be changed here)
        </p>
        <form onSubmit={handleSubmit} className="form-grid form-grid--centered">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input value={user.email} disabled />
          </label>
          <label>
            New password (optional)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
