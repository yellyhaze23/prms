import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireStaff({ children }) {
  const staffToken = typeof window !== 'undefined' ? localStorage.getItem('staff_token') : null;
  const staffRole = typeof window !== 'undefined' ? localStorage.getItem('staff_role') : null;
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('admin_role') : null;
  const location = useLocation();

  // If user is admin (has admin role and no staff tokens), redirect to admin portal
  if (adminRole === 'admin' && (!staffToken || staffRole !== 'staff')) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user has no valid staff credentials, redirect to login
  if (!staffToken || staffRole !== 'staff') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

