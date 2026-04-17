import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function validateUserForm({ name, email, password, autoPassword, isCreate }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = 'Enter a full name.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email.trim()) {
    errors.email = 'Enter an email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (isCreate && !autoPassword && !password) {
    errors.password = 'Enter a temporary password or choose auto-generate.';
  } else if (password && password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}

function getPasswordStrength(password) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { label: 'Weak', tone: 'danger' };
  if (score === 3 || score === 4) return { label: 'Medium', tone: 'warning' };
  return { label: 'Strong', tone: 'success' };
}

export default function UserForm() {
  const { id } = useParams();
  const isCreate = !id;
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('active');
  const [password, setPassword] = useState('');
  const [autoPassword, setAutoPassword] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validationErrors = validateUserForm({ name, email, password, autoPassword, isCreate });
  const passwordStrength = getPasswordStrength(password);
  const fieldError = (field) => (touched[field] ? validationErrors[field] : '');

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
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(validationErrors).length) {
      setError('Please correct the highlighted fields before creating the user.');
      return;
    }
    setSaving(true);
    try {
      const body = { name, email, role, status, autoPassword };
      if (!autoPassword) {
        body.password = password;
      }
      const { data } = await api.post('/api/users', body);
      if (data.generatedPassword) {
        toast.success('User created. Share the generated password securely.');
        setGeneratedPassword(data.generatedPassword);
      } else {
        toast.success('User created successfully.');
        navigate(`/users/${data.user._id || data.user.id}`);
      }
    } catch (err) {
      const nextError = err.response?.data?.message || 'Create failed';
      setError(nextError);
      toast.error(nextError);
    } finally {
      setSaving(false);
    }
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true });
    if (Object.keys(validationErrors).length) {
      setError('Please correct the highlighted fields before saving.');
      return;
    }
    setSaving(true);
    try {
      const body = { name, email, status };
      if (isAdmin) body.role = role;
      await api.patch(`/api/users/${id}`, body);
      toast.success('User changes saved.');
      navigate(`/users/${id}`);
    } catch (err) {
      const nextError = err.response?.data?.message || 'Update failed';
      setError(nextError);
      toast.error(nextError);
    } finally {
      setSaving(false);
    }
  };

  if (!isCreate && loading) {
    return (
      <div className="card">
        <Skeleton variant="detail" />
      </div>
    );
  }

  if (isCreate && !isAdmin) {
    return (
      <div className="card">
        <EmptyState
          icon="Locked"
          title="Only admins can create users"
          description="Switch to an administrator account if you need to add a new user."
          action={<Link to="/users" className="btn btn-secondary">Back to users</Link>}
        />
      </div>
    );
  }

  if (generatedPassword) {
    return (
      <div className="card">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Users', to: '/users' }, { label: 'User created' }]} />
        <h1>User created</h1>
        <p>Share this temporary password securely. The user should change it on first sign-in.</p>
        <p className="generated-password">{generatedPassword}</p>
        <Link to="/users" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Back to users
        </Link>
      </div>
    );
  }

  const formHeadline = isCreate ? 'User Details' : 'Edit user';

  return (
    <div className={`user-form-page${isCreate ? ' user-form-page--new' : ''}`}>
      <div className="card login-card user-form-card">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Users', to: '/users' },
            { label: formHeadline },
          ]}
        />
        <h1>{formHeadline}</h1>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <form className="form-grid" onSubmit={isCreate ? submitCreate : submitUpdate} aria-busy={saving} style={{borderLeft: '6px solid #1e8449', padding: '1.5rem', marginBottom: '2rem'}}>
        <label htmlFor="user-name">
          <span className="field-label-text">
            Name <span className="required-mark">*</span>
          </span>
          <input
            id="user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            aria-invalid={Boolean(fieldError('name'))}
            aria-describedby={fieldError('name') ? 'user-name-error' : undefined}
            required
          />
          {fieldError('name') && (
            <span id="user-name-error" className="field-error" role="alert">
              {fieldError('name')}
            </span>
          )}
        </label>
        <label htmlFor="user-email">
          <span className="field-label-text">
            Email <span className="required-mark">*</span>
          </span>
          <input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={fieldError('email') ? 'user-email-error' : undefined}
            required
          />
          {fieldError('email') && (
            <span id="user-email-error" className="field-error" role="alert">
              {fieldError('email')}
            </span>
          )}
        </label>
        {isAdmin && (
          <label htmlFor="user-role">
            <span className="field-label-text">Role</span>
            <select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <label htmlFor="user-status">
          <span className="field-label-text">Status</span>
          <select id="user-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        {isCreate && (
          <>
            <label htmlFor="user-auto-password" className="checkbox-label">
              <input id="user-auto-password" type="checkbox" checked={autoPassword} onChange={(e) => setAutoPassword(e.target.checked)} />
              Auto-generate password
            </label>
            <span className="helper-text">
              {autoPassword
                ? 'A secure temporary password will be generated after creation.'
                : 'Set a temporary password now or switch to auto-generate.'}
            </span>
            {!autoPassword && (
              <label htmlFor="user-password">
                <span className="field-label-text">
                  Password <span className="required-mark">*</span>
                </span>
                <div className="field-input-group">
                  <input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldError('password'))}
                    aria-describedby={fieldError('password') ? 'user-password-error' : 'user-password-help'}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {fieldError('password') ? (
                  <span id="user-password-error" className="field-error" role="alert">
                    {fieldError('password')}
                  </span>
                ) : (
                  <span id="user-password-help" className="helper-text">
                    Use at least 8 characters with a mix of upper, lower, number, and symbol.
                  </span>
                )}
                {passwordStrength && <span className={`password-strength password-strength-${passwordStrength.tone}`}>Strength: {passwordStrength.label}</span>}
              </label>
            )}
          </>
        )}
        {!isCreate && (
          <p className="helper-text user-form-password-note">
            Passwords can only be changed by the user themselves from{' '}
            <Link to="/profile">My profile</Link>.
          </p>
        )}
        <div className="form-actions-row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isCreate ? 'Create' : 'Save'}
          </button>
          <Link
            to={isCreate ? '/users' : `/users/${id}`}
            className="btn btn-secondary form-actions-row__link"
          >
            Cancel
          </Link>
        </div>
      </form>
      </div>
    </div>
  );
}
