import React from 'react';
import Layout from '../../shared/components/Layout';

export default function StaffLayout({ sidebarCollapsed = false }) {
  return <Layout headerTitle="Staff Portal" sidebarCollapsed={sidebarCollapsed} />;
}
