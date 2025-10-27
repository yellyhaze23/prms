import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { staffNav } from '../config/navConfig';

export default function Layout({ title = 'Tracely', subtitle = 'Track disease easily', nav = staffNav, headerTitle = 'Staff Portal', headerSubtitle, sidebarCollapsed = false }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar nav={nav} brandTitle={title} brandSubtitle={subtitle} collapsed={sidebarCollapsed} />
      <main className="pt-4 lg:pt-0">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

