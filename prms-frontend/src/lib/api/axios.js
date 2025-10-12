import axios from 'axios';

const baseURL = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost/prms/prms-backend/api/staff');

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
