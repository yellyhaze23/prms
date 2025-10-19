import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api/axios';
import { 
  FaUsers, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaChartPie
} from 'react-icons/fa';
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../../utils/animations';

export default function StaffDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard.php')
      .then((r) => setData(r.data?.data || r.data))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{String(error)}</div>;
  }

  const kpis = data?.kpis || { assigned_patients: 0, active_cases: 0, tasks_due_today: 0 };
  const lastUpdated = new Date();

  return (
    <motion.div 
      className="min-h-screen"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Hero header (matches Admin look) */}
      <motion.div 
        className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Tracely Patient Record System</h1>
            <p className="text-blue-100 mt-2">Welcome to the Rural Health Unit Patient Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-blue-100 text-sm">
              <FaClock className="inline mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assigned Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.assigned_patients}</p>
              <p className="text-xs text-gray-500">Patients linked to you</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.active_cases}</p>
              <p className="text-xs text-gray-500">Current patients</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          variants={cardVariants}
          whileHover={hoverScale}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasks Due Today</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.tasks_due_today}</p>
              <p className="text-xs text-gray-500">Reminders</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Row (placeholders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-600" />
            Weekly Trends
          </h3>
          <div className="h-64 bg-slate-100 rounded flex items-center justify-center text-slate-500">
            Chart placeholder
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartPie className="mr-2 text-green-600" />
            Age Distribution
          </h3>
          <div className="h-64 bg-slate-100 rounded flex items-center justify-center text-slate-500">
            Doughnut placeholder
          </div>
        </div>
      </div>
    </motion.div>
  );
}
