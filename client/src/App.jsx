import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import UserDetail from './pages/UserDetail.jsx';
import UserForm from './pages/UserForm.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <UserForm />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
