import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api/axios';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { 
  FaUsers, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaChartPie,
  FaStethoscope,
  FaUserPlus,
  FaHistory,
  FaMapMarkerAlt,
  FaCog,
  FaFileAlt,
  FaVirus,
  FaClipboardList
} from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

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
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentUser, setCurrentUser] = useState({ name: 'Staff' });
  const navigate = useNavigate();

  // Get greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  // Get current user name from database
  const getCurrentUserName = () => {
    return currentUser.username || currentUser.name || "Staff";
  };

  // Fetch current user data from staff-specific endpoint
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('staff_token');
      const response = await fetch('http://localhost/prms/prms-backend/api/staff/me.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  useEffect(() => {
    // Fetch current user data
    fetchCurrentUser();
    
    // Fetch dashboard data
    setLoading(true);
    api.get('/dashboard.php')
      .then((r) => {
        setData(r.data?.data || r.data);
        setLastUpdated(new Date());
      })
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
  const top_barangays = data?.top_barangays || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Chart data for disease distribution - Bar Chart
  const diseaseBarChartData = {
    labels: charts.disease_distribution.map(item => item.disease),
    datasets: [{
      label: 'Cases',
      data: charts.disease_distribution.map(item => item.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue with transparency
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 40,
    }]
  };

  // Chart options for Doughnut
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#374151'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Chart data for age distribution - Doughnut (Pie) Chart
  const ageDoughnutChartData = {
    labels: charts.age_distribution.map(item => item.age_group),
    datasets: [{
      data: charts.age_distribution.map(item => item.count),
      backgroundColor: [
        '#3B82F6', // Blue
        '#10B981', // Green  
        '#F59E0B', // Orange
        '#EF4444', // Red
        '#8B5CF6'  // Purple
      ],
      borderColor: '#fff',
      borderWidth: 2,
      cutout: '60%', // Makes it a donut chart
      spacing: 2
    }]
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#374151'
        }
      }
    }
  };

  // Weekly Trends Chart Data (Last 7 Days)
  const weeklyTrendsData = {
    labels: charts.weekly_trends.map(item => {
      const date = new Date(item.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Format date string for comparison
      const dateStr = date.toDateString();
      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();
      
      if (dateStr === todayStr) return 'Today';
      if (dateStr === yesterdayStr) return 'Yesterday';
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Cases',
      data: charts.weekly_trends.map(item => item.count),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#6B7280',
          precision: 0
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: false,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: '#374151'
        }
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modern Header */}
      <motion.div 
        className="mb-5"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              {getGreeting()}, {getCurrentUserName()}
            </h1>
            <p className="text-gray-700 font-bold text-lg mt-1">Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-gray-500 text-sm">
                <FaClock className="inline mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
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
      </motion.div>

      {/* Charts and Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Distribution - Bar Chart */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-600" />
            Disease Distribution
          </h3>
          {charts.disease_distribution.length > 0 ? (
            <div className="h-64">
              <Bar data={diseaseBarChartData} options={barOptions} />
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
              No disease data available
            </div>
          )}
        </motion.div>

        {/* Age Distribution - Pie Chart */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartPie className="mr-2 text-green-600" />
            Age Distribution
          </h3>
          {charts.age_distribution.length > 0 ? (
            <div className="h-64">
              <Doughnut data={ageDoughnutChartData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
              No age data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Weekly Trends, Top Barangays, and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends Chart */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-purple-600" />
            Weekly Trends
          </h3>
          {charts.weekly_trends.length > 0 ? (
            <div className="h-64">
              <Line data={weeklyTrendsData} options={lineChartOptions} />
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
              No trends data available
            </div>
          )}
        </motion.div>

        {/* Top Barangays Widget */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-orange-600" />
            Top Barangays
          </h3>
          {top_barangays.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {top_barangays.slice(0, 5).map((barangay, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{barangay.barangay}</p>
                      <p className="text-xs text-gray-500">Cases this week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{barangay.count}</p>
                    <p className="text-xs text-gray-500">patients</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
              No barangay data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        variants={cardVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaCog className="mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <motion.button
            onClick={() => navigate('/staff/patients')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUsers className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-blue-800 font-medium text-sm">Patients</span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/staff/records')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFileAlt className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-green-800 font-medium text-sm">Records</span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/staff/diseases')}
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaVirus className="h-8 w-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-red-800 font-medium text-sm">Diseases</span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/staff/tracker')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaMapMarkerAlt className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-purple-800 font-medium text-sm">Tracker</span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/staff/reports')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaClipboardList className="h-8 w-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-yellow-800 font-medium text-sm">Reports</span>
          </motion.button>
        </div>
      </motion.div>

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
