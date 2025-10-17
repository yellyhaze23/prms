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
export const clearCache = () => {
  cache.clear();
};
