import axios from 'axios';

// Staff API instance (namespaced auth and cookies)
export const staffApi = axios.create({
  baseURL: (import.meta?.env?.VITE_STAFF_API_BASE_URL || 'http://localhost/prms/prms-backend/api/staff'),
  withCredentials: true,
});

staffApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('staff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

staffApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default staffApi;
