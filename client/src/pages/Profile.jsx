import { useState } from 'react';
import { useToast } from '../components/ToastProvider.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, persistAuth, loadStoredAuth } from '../api/client.js';

function validateProfile(name, password) {
  const errors = {};
  if (!name.trim()) {
    errors.name = 'Enter your name.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }
  if (password && password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export default function Profile() {
  const { user, refreshSession } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validationErrors = validateProfile(name, password);
  const fieldError = (field) => (touched[field] ? validationErrors[field] : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setTouched({ name: true, password: true });
    if (Object.keys(validationErrors).length) {
      setError('Please correct the highlighted fields before saving.');
      return;
    }
    setLoading(true);
    try {
      const body = { name };
      if (password) body.password = password;
      const { data } = await api.patch(`/api/users/${user.id}`, body);
      setMessage('Profile updated.');
      toast.success('Your profile changes have been saved.');
      setPassword('');
      const stored = loadStoredAuth();
      if (stored) {
        persistAuth({ ...stored, user: data.user });
      }
      await refreshSession();
    } catch (err) {
      const nextError = err.response?.data?.message || 'Update failed';
      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="card login-card profile-card" style={{borderLeft: '6px solid #1e8449', padding: '1.5rem', marginBottom: '2rem'}}>
        <div className="success-banner" style={{marginBottom: 0}}>
          <h1 style={{margin: 0}}>My profile</h1>
        </div>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="success-banner" role="status">
            {message}
          </div>
        )}
        <p className="muted">
          Role: <strong>{user.role}</strong> (cannot be changed here)
        </p>
        <form onSubmit={handleSubmit} className="form-grid form-grid--centered success-banner" aria-busy={loading}>
          <label htmlFor="profile-name">
            <span className="field-label-text">
              Name <span className="required-mark">*</span>
            </span>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, name: true }))}
              aria-invalid={Boolean(fieldError('name'))}
              aria-describedby={fieldError('name') ? 'profile-name-error' : undefined}
              required
            />
            {fieldError('name') && (
              <span id="profile-name-error" className="field-error" role="alert">
                {fieldError('name')}
              </span>
            )}
          </label>
          <label htmlFor="profile-email">
            <span className="field-label-text">Email</span>
            <input id="profile-email" value={user.email} disabled aria-describedby="profile-email-help" />
            <span id="profile-email-help" className="helper-text">
              Email is locked here to protect your sign-in identity.
            </span>
          </label>
          <label htmlFor="profile-password">
            <span className="field-label-text">New password (optional)</span>
            <div className="field-input-group">
              <input
                id="profile-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                autoComplete="new-password"
                placeholder="Leave blank to keep current"
                aria-invalid={Boolean(fieldError('password'))}
                aria-describedby={fieldError('password') ? 'profile-password-error' : 'profile-password-help'}
              />
              <button
                type="button"
                className="btn btn-secondary btn-inline"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide new password' : 'Show new password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldError('password') ? (
              <span id="profile-password-error" className="field-error" role="alert">
                {fieldError('password')}
              </span>
            ) : (
              <span id="profile-password-help" className="helper-text">
                Use at least 8 characters if you set a new password.
              </span>
            )}
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
