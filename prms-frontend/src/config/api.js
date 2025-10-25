/**
 * API Configuration
 * Centralized API base URLs from environment variables
 */

// Get base URL from environment variables or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/prms/prms-backend';
export const STAFF_API_BASE_URL = import.meta.env.VITE_STAFF_API_BASE_URL || 'http://localhost/prms/prms-backend/api/staff';

// Helper function to build API endpoint URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getStaffApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${STAFF_API_BASE_URL}/${cleanEndpoint}`;
};

// Export as default for convenience
export default {
  API_BASE_URL,
  STAFF_API_BASE_URL,
  getApiUrl,
  getStaffApiUrl
};

