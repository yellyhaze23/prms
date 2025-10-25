// Route preloader for instant navigation
const preloadedComponents = new Map();

export const preloadRoute = (routePath) => {
  if (preloadedComponents.has(routePath)) {
    return preloadedComponents.get(routePath);
  }

  let componentPromise;
  
  switch (routePath) {
    case '/':
    case '/dashboard':
      componentPromise = import('../admin/Dashboard');
      break;
    case '/patient':
      componentPromise = import('../admin/Patient');
      break;
    case '/records':
      componentPromise = import('../admin/Records');
      break;
    case '/diseases':
      componentPromise = import('../admin/Diseases');
      break;
    case '/tracker':
      componentPromise = import('../admin/Tracker');
      break;
    case '/arima-forecast':
      componentPromise = import('../admin/ARIMAForecast');
      break;
    case '/reports':
      componentPromise = import('../admin/Reports');
      break;
    case '/audit-logs':
      componentPromise = import('../admin/AuditLogs');
      break;
    case '/settings':
      componentPromise = import('../admin/Settings');
      break;
    case '/staff/dashboard':
      componentPromise = import('../staff/pages/Dashboard');
      break;
    case '/staff/patients':
      componentPromise = import('../staff/pages/Patients');
      break;
    case '/staff/records':
      componentPromise = import('../staff/pages/Records');
      break;
    case '/staff/tracking':
      componentPromise = import('../staff/pages/Tracking');
      break;
    case '/staff/reports':
      componentPromise = import('../staff/pages/Reports');
      break;
    case '/staff/audit-logs':
      componentPromise = import('../staff/pages/AuditLogs');
      break;
    case '/staff/profile':
      componentPromise = import('../staff/pages/Profile');
      break;
    case '/staff/settings':
      componentPromise = import('../staff/pages/Settings');
      break;
    default:
      return Promise.resolve();
  }

  preloadedComponents.set(routePath, componentPromise);
  return componentPromise;
};

export const preloadAllRoutes = () => {
  const routes = [
    '/', '/patient', '/records', '/diseases', '/tracker', '/arima-forecast', '/reports', '/audit-logs', '/settings',
    '/staff/dashboard', '/staff/patients', '/staff/records', '/staff/tracking', '/staff/reports', '/staff/audit-logs', '/staff/profile', '/staff/settings'
  ];
  
  routes.forEach(route => {
    preloadRoute(route);
  });
};
