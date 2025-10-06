import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireStaff({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const location = useLocation();

  if (!token || role !== 'staff') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
