import axios from 'axios';

/**
 * Axios instance with JWT interceptor.
 *
 * The interceptor automatically attaches the JWT token stored in localStorage
 * to every outgoing request's Authorization header.  This eliminates the need
 * to manually pass the token in each API call.
 *
 * Interview talking point: Axios interceptors are how modern SPAs maintain
 * authenticated sessions with stateless backend APIs.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 (expired/invalid token) ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
