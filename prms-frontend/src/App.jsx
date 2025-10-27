import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StaffTopBar from "./staff/components/StaffTopBar";
import Login from "./admin/Login";
import SessionManager from "./components/SessionManager";
import StaffSessionManager from "./staff/components/StaffSessionManager";
import { BackupProvider } from "./contexts/BackupContext";
import "./App.css";
import "./index.css";
// Performance optimizations
import { preloadAllRoutes } from './utils/routePreloader';
import { preloadAllData } from './utils/dataPreloader';
import { clearCache } from './utils/cache';

// Lazy load all pages for faster initial load
const Dashboard = lazy(() => import('./admin/Dashboard'));
const Patient = lazy(() => import('./admin/Patient'));
const Records = lazy(() => import('./admin/Records'));
const Diseases = lazy(() => import('./admin/Diseases'));
const Tracker = lazy(() => import('./admin/Tracker'));
const ARIMAForecast = lazy(() => import('./admin/ARIMAForecast'));
const Reports = lazy(() => import('./admin/Reports'));
const AuditLogs = lazy(() => import('./admin/AuditLogs'));
const Settings = lazy(() => import('./admin/Settings'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));

// Route protection components
const RequireAdmin = lazy(() => import('./components/RequireAdmin'));
const RequireStaff = lazy(() => import('./staff/components/RequireStaff'));
const StaffLayout = lazy(() => import('./staff/layouts/StaffLayout'));
const StaffDashboard = lazy(() => import('./staff/pages/Dashboard'));
const StaffPatients = lazy(() => import('./staff/pages/Patients'));
const StaffRecords = lazy(() => import('./staff/pages/Records'));
const StaffDiseases = lazy(() => import('./staff/pages/StaffDiseases'));
const StaffTracker = lazy(() => import('./staff/pages/Tracking'));
const StaffReports = lazy(() => import('./staff/pages/Reports'));
const StaffSettings = lazy(() => import('./staff/pages/Settings'));
const StaffARIMAForecast = lazy(() => import('./staff/pages/StaffARIMAForecast'));

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [staffSidebarCollapsed, setStaffSidebarCollapsed] = useState(() => {
    return localStorage.getItem("staffSidebarCollapsed") === "true";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const toggleStaffSidebar = () => {
    const newState = !staffSidebarCollapsed;
    setStaffSidebarCollapsed(newState);
    localStorage.setItem("staffSidebarCollapsed", newState.toString());
  };

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
      setIsLoggingOut(true);
      clearCache();
    };
    
    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [isLoggedIn]);

  const handleLogin = (user) => {
    setIsTransitioning(true);
    
    // Small delay to allow the loading modal success animation to complete
    setTimeout(() => {
      sessionStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      
      try {
        // Clear ALL auth tokens first to prevent conflicts
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_role');
        localStorage.removeItem('admin_role');
        localStorage.removeItem('admin_token');
        
        if (user?.role === 'staff') {
          // Set staff auth keys
          localStorage.setItem('staff_token', 'test-staff-token');
          localStorage.setItem('staff_role', 'staff');
          navigate('/staff/dashboard', { replace: true });
        } else {
          // Set admin auth keys
          localStorage.setItem('admin_token', 'test-admin-token');
          localStorage.setItem('admin_role', 'admin');
          navigate('/', { replace: true });
        }
      } catch {}
      
      // Reset transition state after navigation
      setTimeout(() => {
        setIsTransitioning(false);
        
        // Dispatch login event AFTER navigation completes to update user badges
        // Increased delay to ensure session cookie is set
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('login'));
        }, 500);
      }, 300);
    }, 100);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const isStaffRoute = location.pathname.startsWith('/staff');

  // Wrap content with SessionManager only for admin routes
  const appContent = (
    <div className="app-layout">
      {!isStaffRoute && <Sidebar collapsed={sidebarCollapsed} />}
      {!isStaffRoute && <TopBar userId={1} userName="Admin" userRole="Administrator" onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />}
      {isStaffRoute && <StaffTopBar onToggleSidebar={toggleStaffSidebar} sidebarCollapsed={staffSidebarCollapsed} />}
      <div className={`main-content ${isStaffRoute ? (staffSidebarCollapsed ? 'sidebar-collapsed' : '') : (sidebarCollapsed ? 'sidebar-collapsed' : '')} ${isTransitioning ? 'page-enter' : ''} ${isLoggingOut ? 'page-exit' : ''}`}>
        <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
              <Route path="/records" element={<RequireAdmin><Records /></RequireAdmin>} />
              <Route path="/patient" element={<RequireAdmin><Patient /></RequireAdmin>} />
              <Route path="/diseases" element={<RequireAdmin><Diseases /></RequireAdmin>} />
              <Route path="/tracker" element={<RequireAdmin><Tracker /></RequireAdmin>} />
              <Route path="/arima-forecast" element={<RequireAdmin><ARIMAForecast /></RequireAdmin>} />
              <Route path="/reports" element={<RequireAdmin><Reports /></RequireAdmin>} />
              <Route path="/audit-logs" element={<RequireAdmin><AuditLogs /></RequireAdmin>} />
              <Route path="/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
              <Route path="/notifications" element={<RequireAdmin><NotificationCenter /></RequireAdmin>} />
              {/** Staff Portal */}
              <Route
                path="/staff/*"
                element={
                  <RequireStaff>
                    <StaffLayout sidebarCollapsed={staffSidebarCollapsed} />
                  </RequireStaff>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="patients" element={<StaffPatients />} />
                <Route path="records" element={<StaffRecords />} />
                <Route path="diseases" element={<StaffDiseases />} />
                <Route path="tracking" element={<StaffTracker />} />
                <Route path="forecasts" element={<StaffARIMAForecast />} />
                <Route path="reports" element={<StaffReports />} />
                <Route path="settings" element={<StaffSettings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </div>
  );

  return (
    <BackupProvider>
      {isStaffRoute ? (
        <StaffSessionManager>{appContent}</StaffSessionManager>
      ) : (
        <SessionManager>{appContent}</SessionManager>
      )}
    </BackupProvider>
  );
}

export default App;





