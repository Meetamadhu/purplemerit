import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Users() {
  const { isAdmin } = useAuth();

  const [data, setData] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(10);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get('/api/users', {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
          role: role || undefined,
          status: status || undefined,
        },
      });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role, status, limit, debouncedSearch]);

  const users = data.data || [];
  const meta = data.meta || {};
  const hasFilters = Boolean(debouncedSearch || role || status);

  return (
    <div className="page-container">
      <div className="users-page-panel">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="text-muted">
            Manage users, roles, and permissions.
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="page-actions-center">
          <Link to="/users/new" className="btn btn-primary">
            User Details
          </Link>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/' }, { label: 'Users' }]} />

      {/* Error */}
      {error && (
        <div className="card" style={{borderLeft: '6px solid #1e8449'}}>
          <p className="text-danger">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{borderLeft: '6px solid #1e8449'}}>
        <div className="filter-grid">
          <input
            className="input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search by name or email"
          />

          <select
            className="input"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="input"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{borderLeft: '6px solid #1e8449'}}>

        {loading ? (
          <Skeleton variant="table" rows={6} />
        ) : users.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No users found' : 'No users yet'}
            description={
              hasFilters
                ? 'Try adjusting your filters.'
                : 'Create your first user to get started.'
            }
          />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => {
                  const id = u._id || u.id;

                  return (
                    <tr key={id} className="table-row">
                      <td>{u.name}</td>
                      <td>{u.email}</td>

                      <td>
                        <span className={`badge badge-${u.role}`}>
                          {u.role}
                        </span>
                      </td>

                      <td>
                        <span className={`badge badge-${u.status}`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="text-right">
                        <Link to={`/users/${id}`} className="btn btn-ghost">
                          View
                        </Link>

                        {(isAdmin || u.role !== 'admin') && (
                          <Link to={`/users/${id}/edit`} className="btn btn-ghost">
                            Edit
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination-bar">
              <button
                type="button"
                className="btn btn-dark"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>

              <span className="text-muted">
                Page {meta.page || 1} of {meta.pages || 1}
              </span>

              <button
                type="button"
                className="btn btn-dark"
                disabled={page >= (meta.pages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
