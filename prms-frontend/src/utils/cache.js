const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const BACKGROUND_REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    lastRefresh: Date.now()
  });
};

export const shouldRefreshInBackground = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.lastRefresh > BACKGROUND_REFRESH_THRESHOLD) {
    return true;
  }
  return false;
};

export const markAsRefreshed = (key) => {
  const cached = cache.get(key);
  if (cached) {
    cached.lastRefresh = Date.now();
  }
};

// Clear cache when user logs out
export const clearCache = async () => {
  cache.clear();
  
  // Call backend logout to destroy PHP session
  try {
    await fetch('http://localhost/prms-backend/logout.php', {
      method: 'POST',
      credentials: 'include', // Important: send cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error calling backend logout:', error);
    // Continue with frontend cleanup even if backend call fails
  }
  
  // Clear all auth tokens from localStorage
  localStorage.removeItem('staff_token');
  localStorage.removeItem('staff_role');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_role');
};

