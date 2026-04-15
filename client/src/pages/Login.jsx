import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (ready && user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const backendMsg =
        typeof err.response?.data?.message === 'string'
          ? err.response.data.message
          : err.response?.data?.message?.[0]?.msg;
      let msg = backendMsg || err.message || 'Login failed';
      if (!err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
        msg =
          'Cannot reach the API (network/CORS). If the backend is on Render, set VITE_API_URL in Vercel to your API base URL (https://…, no trailing slash), save, then Redeploy. On Render set CLIENT_ORIGIN to this site (https://…vercel.app).';
      } else if (status === 404) {
        msg =
          'API returned 404. This often means the browser called /api on Vercel but the API is elsewhere — set VITE_API_URL on Vercel to your Render URL and redeploy.';
      } else if (status === 401 || status === 403) {
        msg = backendMsg || 'Invalid email or password, or account inactive.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <SiteHeader end="Sign in" />
      <div className="login-page">
        <div className="card login-card">
          <h1>Sign in</h1>
          <p className="muted">
            Demo logins (email → first box, password → second). Run <code>npm run seed</code> in{' '}
            <code>server</code> if login fails.
          </p>
          <ul className="muted login-hints">
            <li>
              <strong>admin@example.com</strong> / Admin123!
            </li>
            <li>
              <strong>manager@example.com</strong> / Manager123!
            </li>
            <li>
              <strong>user@example.com</strong> / User12345!
            </li>
          </ul>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid form-grid--centered">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
