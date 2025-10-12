import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Patient from "./pages/Patient";
import Records from "./pages/Records";
import Diseases from "./pages/Diseases";
// import Logbook from "./pages/Logbook";
import Tracker from "./pages/Tracker";
import ARIMAForecast from "./pages/ARIMAForecast";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import "./App.css";
import "./index.css";
// Staff portal imports
import RequireStaff from "./staff/components/RequireStaff";
import StaffLayout from "./staff/layouts/StaffLayout";
import StaffDashboard from "./staff/pages/Dashboard";
import StaffPatients from "./staff/pages/Patients";
import StaffRecords from "./staff/pages/Records";
import StaffTracker from "./staff/pages/Tracking";
import StaffReports from "./staff/pages/Reports";
import StaffLogs from "./staff/pages/AuditLogs";
import StaffProfile from "./staff/pages/Profile";
import StaffSettings from "./staff/pages/Settings";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

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
      </div>
    </div>
  );
}

export default App;




