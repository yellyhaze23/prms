import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { staffNav } from '../config/navConfig';

export default function Layout({ title = 'RHU PRS', subtitle = 'Staff Portal', nav = staffNav, headerTitle = 'Staff Portal', headerSubtitle }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar nav={nav} brandTitle={title} brandSubtitle={subtitle} />
      <main className="lg:mmax-w-7xl mx-auto px-4 sm:px-6 lg:px-8l-64">
       {/* <Header title={headerTitle} subtitle={headerSubtitle} /> */}
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
