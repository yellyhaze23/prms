import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api/axios';
import { 
  FaUsers, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaChartPie,
  FaStethoscope,
  FaUserPlus,
  FaHeartbeat,
  FaCalendarAlt,
  FaHistory
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

  const kpis = data?.kpis || { 
    total_patients: 0, 
    active_cases: 0, 
    infected_patients: 0, 
    healthy_patients: 0, 
    recent_patients: 0, 
    tasks_due_today: 0 
  };
  const charts = data?.charts || { disease_distribution: [], weekly_trends: [], age_distribution: [] };
  const activities = data?.recent_activities || [];
  const lastUpdated = new Date();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      className="min-h-screen space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Hero header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Staff Dashboard</h1>
            <p className="text-blue-100 mt-2">Your patient management overview</p>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.total_patients}</p>
              <p className="text-xs text-gray-500">Assigned to you</p>
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
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaStethoscope className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Infected Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.infected_patients}</p>
              <p className="text-xs text-gray-500">With diagnoses</p>
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
                <FaHeartbeat className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Healthy Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.healthy_patients}</p>
              <p className="text-xs text-gray-500">No active diagnoses</p>
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
              <p className="text-xs text-gray-500">Recent medical records</p>
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaUserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Patients</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.recent_patients}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
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
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Follow-ups Due</p>
              <p className="text-2xl font-semibold text-gray-900">{kpis.tasks_due_today}</p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts and Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Distribution */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartPie className="mr-2 text-blue-600" />
            Disease Distribution
          </h3>
          {charts.disease_distribution.length > 0 ? (
            <div className="space-y-3">
              {charts.disease_distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.disease}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...charts.disease_distribution.map(d => d.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
              No disease data available
            </div>
          )}
        </motion.div>

        {/* Age Distribution */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartPie className="mr-2 text-green-600" />
            Age Distribution
          </h3>
          {charts.age_distribution.length > 0 ? (
            <div className="space-y-3">
              {charts.age_distribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.age_group}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / Math.max(...charts.age_distribution.map(a => a.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
              No age data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        variants={cardVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaHistory className="mr-2 text-purple-600" />
          Recent Activities
        </h3>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.activity === 'New Patient' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                    <p className="text-xs text-gray-500">{activity.patient_name}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            No recent activities
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
