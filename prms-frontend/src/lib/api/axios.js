import axios from 'axios';

// Staff API instance (namespaced auth and cookies)
export const staffApi = axios.create({
  baseURL: (import.meta?.env?.VITE_STAFF_API_BASE_URL || '/prms-backend/api/staff'),
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
      // Only logout if we're not already on login page and session is truly invalid
      // Check if staff token exists - if it does, the 401 might be a race condition
      const staffToken = localStorage.getItem('staff_token');
      const currentPath = window.location.pathname;
      
      // Don't redirect if we're already on login page or if token exists (might be timing issue)
      if (currentPath !== '/' && !staffToken) {
        console.warn('Unauthorized access - redirecting to login');
        window.location.href = '/';
      } else if (staffToken) {
        console.warn('Got 401 but staff token exists - might be timing issue, not logging out');
      }
    }
    return Promise.reject(err);
  }
);

export default staffApi;

