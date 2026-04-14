import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const STORAGE_KEY = 'ums_auth';

export function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistAuth({ accessToken, refreshToken, user }) {
  const payload = { accessToken, refreshToken, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
  delete api.defaults.headers.common.Authorization;
}

let refreshPromise = null;

async function refreshAccessToken() {
  const stored = loadStoredAuth();
  if (!stored?.refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
    refreshToken: stored.refreshToken,
  });
  const next = { ...stored, accessToken: data.accessToken };
  persistAuth(next);
  return data.accessToken;
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry || original.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      const stored = loadStoredAuth();
      original.headers.Authorization = `Bearer ${stored.accessToken}`;
      return api(original);
    } catch {
      clearStoredAuth();
      return Promise.reject(error);
    }
  }
);
