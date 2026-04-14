import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearStoredAuth, loadStoredAuth, persistAuth } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const bootstrap = useCallback(async () => {
    const stored = loadStoredAuth();
    if (!stored?.accessToken) {
      setUser(null);
      setReady(true);
      return;
    }
    persistAuth(stored);
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
      persistAuth({ ...stored, user: data.user });
    } catch {
      clearStoredAuth();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    persistAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
      refreshSession: bootstrap,
      isAdmin: user?.role === 'admin',
      isManager: user?.role === 'manager',
      canManageUsers: user?.role === 'admin' || user?.role === 'manager',
    }),
    [user, ready, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
