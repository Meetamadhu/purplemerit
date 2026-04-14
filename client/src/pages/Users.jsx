import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Users() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/api/users', {
        params: { page, limit: 10, search, role: role || undefined, status: status || undefined },
      });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role, status]);

  const applySearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/api/users', {
        params: { page: 1, limit: 10, search, role: role || undefined, status: status || undefined },
      });
      setData(res);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Users</h1>
        {isAdmin && (
          <Link to="/users/new" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Create user
          </Link>
        )}
      </div>
      {error && <div className="error-banner">{error}</div>}
      <form className="toolbar" onSubmit={applySearch}>
        <label>
          Search
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" />
        </label>
        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button type="submit" className="btn btn-secondary">
          Apply
        </button>
      </form>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => {
                  const id = u._id || u.id;
                  return (
                    <tr key={id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${u.status}`}>{u.status}</span>
                      </td>
                      <td>
                        <Link to={`/users/${id}`}>View</Link>
                        {isAdmin && (
                          <>
                            {' · '}
                            <Link to={`/users/${id}/edit`}>Edit</Link>
                          </>
                        )}
                        {!isAdmin && u.role !== 'admin' && (
                          <>
                            {' · '}
                            <Link to={`/users/${id}/edit`}>Edit</Link>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span className="muted">
              Page {data.meta.page} of {data.meta.pages} ({data.meta.total} total)
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page >= (data.meta.pages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
