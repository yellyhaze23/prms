import { getCachedData, setCachedData, shouldRefreshInBackground, markAsRefreshed } from './cache';

// Data preloader for instant data loading
const preloadPromises = new Map();

export const preloadData = async (key, fetchFunction) => {
  // Check if already preloading
  if (preloadPromises.has(key)) {
    return preloadPromises.get(key);
  }

  // Check cache first
  const cached = getCachedData(key);
  if (cached && !shouldRefreshInBackground(key)) {
    return Promise.resolve(cached);
  }

  // Start preloading
  const promise = fetchFunction().then(data => {
    setCachedData(key, data);
    markAsRefreshed(key);
    preloadPromises.delete(key);
    return data;
  }).catch(err => {
    preloadPromises.delete(key);
    throw err;
  });

  preloadPromises.set(key, promise);
  return promise;
};

export const preloadAllData = async () => {
  const preloadTasks = [
    preloadData('patients', () => 
      fetch('http://localhost/prms-backend/get_patients.php').then(r => r.json())
    ),
    preloadData('dashboard', () => 
      fetch('http://localhost/prms-backend/get_dashboard_data.php').then(r => r.json())
    ),
    preloadData('diseases', () => 
      fetch('http://localhost/prms-backend/get_diseases.php').then(r => r.json())
    ),
    preloadData('reports', () => 
      fetch('http://localhost/prms-backend/get_reports_data.php').then(r => r.json())
    )
  ];

  // Preload all data in parallel
  await Promise.allSettled(preloadTasks);
};

