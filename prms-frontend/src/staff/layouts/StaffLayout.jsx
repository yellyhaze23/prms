import React from 'react';
import Layout from '../../shared/components/Layout';

export default function StaffLayout({ sidebarCollapsed = false, onToggleSidebar }) {
  return <Layout headerTitle="Staff Portal" sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} />;
}

