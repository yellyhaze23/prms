import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const staffToken = typeof window !== 'undefined' ? localStorage.getItem('staff_token') : null;
  const staffRole = typeof window !== 'undefined' ? localStorage.getItem('staff_role') : null;
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('admin_role') : null;
  const location = useLocation();

  // If user is staff (has staff tokens and no admin role), redirect to staff portal
  if ((staffToken && staffRole === 'staff') || (staffRole === 'staff' && !adminRole)) {
    return <Navigate to="/staff/dashboard" state={{ from: location }} replace />;
  }

  return children;
}

