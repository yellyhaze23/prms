import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import "./App.css";
import "./index.css";
// Performance optimizations
import { preloadAllRoutes } from './utils/routePreloader';
import { preloadAllData } from './utils/dataPreloader';
import { clearCache } from './utils/cache';

// Lazy load all pages for faster initial load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patient = lazy(() => import('./pages/Patient'));
const Records = lazy(() => import('./pages/Records'));
const Diseases = lazy(() => import('./pages/Diseases'));
const Tracker = lazy(() => import('./pages/Tracker'));
const ARIMAForecast = lazy(() => import('./pages/ARIMAForecast'));
const Reports = lazy(() => import('./pages/Reports'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Settings = lazy(() => import('./pages/Settings'));

// Staff portal lazy loading
const RequireStaff = lazy(() => import('./staff/components/RequireStaff'));
const StaffLayout = lazy(() => import('./staff/layouts/StaffLayout'));
const StaffDashboard = lazy(() => import('./staff/pages/Dashboard'));
const StaffPatients = lazy(() => import('./staff/pages/Patients'));
const StaffRecords = lazy(() => import('./staff/pages/Records'));
const StaffTracker = lazy(() => import('./staff/pages/Tracking'));
const StaffReports = lazy(() => import('./staff/pages/Reports'));
const StaffLogs = lazy(() => import('./staff/pages/AuditLogs'));
const StaffProfile = lazy(() => import('./staff/pages/Profile'));
const StaffSettings = lazy(() => import('./staff/pages/Settings'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  // Performance optimization: Preload routes and data on app start
  useEffect(() => {
    if (isLoggedIn) {
      const initializeApp = async () => {
        // Preload all routes for instant navigation
        preloadAllRoutes();
        
        // Preload all data in background
        preloadAllData();
      };
      
      initializeApp();
    }
    
    // Clear cache on logout
    const handleLogout = () => {
      clearCache();
    };
    
    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [isLoggedIn]);

  const handleLogin = (user) => {
    sessionStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    try {
      if (user?.role === 'staff') {
        // Set temporary token/role only for staff while backend JWT is not wired
        localStorage.setItem('token', 'test-staff-token');
        localStorage.setItem('role', 'staff');
        navigate('/staff/dashboard', { replace: true });
      } else {
        // Ensure admin doesn't inherit staff token/role
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/', { replace: true });
      }
    } catch {}
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const isStaffRoute = location.pathname.startsWith('/staff');

  return (
    <div className="app-layout">
      {!isStaffRoute && <Sidebar />}
      <div className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<Records />} />
            <Route path="/patient" element={<Patient />} />
            <Route path="/diseases" element={<Diseases />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/arima-forecast" element={<ARIMAForecast />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
            {/** Staff Portal */}
            <Route
              path="/staff/*"
              element={
                <RequireStaff>
                  <StaffLayout />
                </RequireStaff>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="patients" element={<StaffPatients />} />
              <Route path="records" element={<StaffRecords />} />
              <Route path="tracking" element={<StaffTracker />} />
              <Route path="reports" element={<StaffReports />} />
              <Route path="audit-logs" element={<StaffLogs />} />
              <Route path="profile" element={<StaffProfile />} />
              <Route path="settings" element={<StaffSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;




