import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppFooter from '../components/AppFooter.jsx';
import AppHeader from '../components/AppHeader.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AppHeader />
      <main id="main-content" className="main main--login" tabIndex="-1">
        <div className="login-container">
          <div className="login-card">
            <h2>Sign in</h2>
            <p className="login-subtitle">Enter your credentials to continue</p>

            {error && (
              <div className="error-banner" role="alert">{error}</div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <button
                className="btn btn-primary full-width"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="demo-box">
              <p className="demo-title">Demo Accounts</p>
              <div className="demo-item">
                <span>Admin</span>
                <code>admin@example.com / Admin123!</code>
              </div>
              <div className="demo-item">
                <span>Manager</span>
                <code>manager@example.com / Manager123!</code>
              </div>
              <div className="demo-item">
                <span>User</span>
                <code>user@example.com / User12345!</code>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
