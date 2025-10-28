import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaUsers, 
  FaUser,
  FaFileAlt, 
  FaStethoscope, 
  FaMapMarkerAlt, 
  FaChartBar, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock,
  FaUserMd,
  FaVirus,
  FaBell,
  FaCog,
  FaDatabase,
  FaServer,
  FaChartLine,
  FaChartPie,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from "react-icons/fa";
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import ModernAlert from '../components/ModernAlert';
import CountUp from '../components/CountUp';
import ModernToast from '../components/ModernToast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import axios from "axios";
import "./Dashboard.css";
// Performance optimizations
import { getCachedData, setCachedData, shouldRefreshInBackground, markAsRefreshed } from '../utils/cache';
import { preloadData } from '../utils/dataPreloader';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false); // Start with false for instant display
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertCountdown, setAlertCountdown] = useState(10); // 10 seconds countdown
  const [currentUser, setCurrentUser] = useState({ name: 'Admin' });
  const [diseaseTrends, setDiseaseTrends] = useState({});

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const chartVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Function to calculate trend for disease cases using real historical data
  const calculateTrend = (diseaseName, currentCount) => {
    const trendData = diseaseTrends[diseaseName];
    if (!trendData || !trendData.cases || trendData.cases.length < 2) {
      return 'neutral'; // No historical data to compare
    }
    
    const cases = trendData.cases;
    const currentPeriod = cases[cases.length - 1]; // Most recent period
    const previousPeriod = cases[cases.length - 2]; // Previous period
    
    if (previousPeriod === 0) {
      return currentPeriod > 0 ? 'rising' : 'neutral';
    }
    
    const percentageChange = ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    if (percentageChange > 5) return 'rising';
    if (percentageChange < -5) return 'falling';
    return 'neutral';
  };

  // Function to get trend icon and color
  const getTrendDisplay = (trend) => {
    switch (trend) {
      case 'rising':
        return { icon: FaArrowUp, color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'falling':
        return { icon: FaArrowDown, color: 'text-green-500', bgColor: 'bg-green-50' };
      default:
        return { icon: FaMinus, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchDashboardData();
    fetchDiseaseTrends();
    // Auto-refresh every 5 minutes for real-time updates (reduced from 30 seconds)
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchDiseaseTrends();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for alerts
  useEffect(() => {
    if (alerts.length > 0 && alertCountdown > 0) {
      const timer = setTimeout(() => {
        setAlertCountdown(prev => prev - 0.2);
      }, 500);
      return () => clearTimeout(timer);
    } else if (alerts.length > 0 && alertCountdown === 0) {
      // Auto-hide alerts after countdown
      setAlerts([]);
    }
  }, [alerts.length, alertCountdown]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_current_user.php`);
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        setToast({
          type: 'error',
          message: 'Failed to load user profile'
        });
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setToast({
        type: 'error',
        message: 'Failed to load user profile'
      });
    }
  };

  const fetchDashboardData = async (timeframe = selectedTimeframe, forceRefresh = false) => {
    // Check cache first - INSTANT DISPLAY
    const cacheKey = `dashboard_${timeframe}`;
    const cached = getCachedData(cacheKey);
    if (cached && !forceRefresh) {
      setDashboardData(cached);
      setLoading(false);
      
      // Background refresh if needed
      if (shouldRefreshInBackground(cacheKey)) {
        refreshInBackground(timeframe);
      }
      return;
    }

    // Only show loading if no cached data
    if (!cached) {
      setLoading(true);
    } else {
      setSyncing(true);
    }

    try {
      // Use preloaded data if available
      const data = await preloadData(cacheKey, () => 
        fetch(`${import.meta.env.VITE_API_BASE_URL}/get_dashboard_data.php?timeframe=${timeframe}`).then(r => r.json())
      );
      
      if (data.success) {
        setDashboardData(data);
        setAlerts(data.alerts || []);
        setLastUpdated(new Date());
        setError(null);
        // Reset countdown when new alerts arrive
        if (data.alerts && data.alerts.length > 0) {
          setAlertCountdown(10);
        }
      } else {
        const errorMsg = data.error || "Failed to fetch dashboard data";
        setError(errorMsg);
        setToast({
          type: 'error',
          message: errorMsg
        });
      }
    } catch (err) {
      const errorMsg = "Server error. Please check your connection.";
      setError(errorMsg);
      setToast({
        type: 'error',
        message: errorMsg
      });
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const refreshInBackground = async (timeframe) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_dashboard_data.php?timeframe=${timeframe}`);
      if (response.data.success) {
        setDashboardData(response.data);
        setCachedData(`dashboard_${timeframe}`, response.data);
        markAsRefreshed(`dashboard_${timeframe}`);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Background refresh failed:", err);
      // Silent fail for background refresh - no toast needed
    }
  };

  const fetchDiseaseTrends = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_disease_trends.php?period=7`);
      
      if (response.data.success) {
        setDiseaseTrends(response.data.trends);
      } else {
        console.error('Failed to fetch disease trends:', response.data.message);
        setToast({
          type: 'warning',
          message: 'Failed to load disease trends'
        });
      }
    } catch (error) {
      console.error('Error fetching disease trends:', error);
      setToast({
        type: 'warning',
        message: 'Failed to load disease trends'
      });
    }
  };

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    fetchDashboardData(timeframe);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info': return <FaBell className="text-blue-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 py-6=">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, disease_stats, recent_activities, trends_data, current_timeframe, age_distribution, gender_distribution, top_locations, recent_consultations } = dashboardData;

  // Process trends data based on selected timeframe
  const processTrendsData = () => {
    if (!trends_data || trends_data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = trends_data.map(item => {
      if (selectedTimeframe === 'weekly') {
        return new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return item.date;
      }
    });

    return {
      labels: labels,
      datasets: [
        {
          label: selectedTimeframe === 'weekly' ? 'Daily Cases' : 'Cases',
          data: trends_data.map(item => parseInt(item.cases)),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: 'rgb(99, 102, 241)',
          pointBorderWidth: 2,
          fill: true,
          borderWidth: 3,
          spanGaps: false,
          stepped: false
        },
        {
          label: selectedTimeframe === 'weekly' ? 'Daily Patients' : 'Patients',
          data: trends_data.map(item => parseInt(item.patients)),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: 'rgb(16, 185, 129)',
          pointBorderWidth: 2,
          fill: false,
          borderWidth: 3,
          spanGaps: false,
          stepped: false
        }
      ]
    };
  };

  const trendsChartData = processTrendsData();

  // Calculate smart Y-axis max value
  const calculateYAxisMax = () => {
    if (!trends_data || trends_data.length === 0) return 10;
    
    const maxCases = Math.max(...trends_data.map(item => parseInt(item.cases)));
    const maxPatients = Math.max(...trends_data.map(item => parseInt(item.patients)));
    const maxValue = Math.max(maxCases, maxPatients);
    
    // Show 1-10 by default, but auto-adjust if data exceeds 10
    return Math.max(10, maxValue + 2);
  };

  // Chart data for age distribution - Modern design
  const ageChartData = {
    labels: age_distribution.map(item => item.age_group),
    datasets: [{
      data: age_distribution.map(item => item.count),
      backgroundColor: [
        '#3B82F6', // Blue
        '#10B981', // Green  
        '#F59E0B', // Orange
        '#EF4444', // Red
        '#8B5CF6'  // Purple
      ],
      borderColor: [
        '#1E40AF', // Darker blue
        '#059669', // Darker green
        '#D97706', // Darker orange
        '#DC2626', // Darker red
        '#7C3AED'  // Darker purple
      ],
      borderWidth: 0,
      cutout: '60%',
      spacing: 2
    }]
  };

  // Chart data for gender distribution - Modern design
  const genderChartData = {
    labels: gender_distribution.map(item => item.sex),
    datasets: [{
      data: gender_distribution.map(item => item.count),
      backgroundColor: [
        '#3B82F6', // Blue
        '#EC4899'  // Pink
      ],
      borderColor: [
        '#1E40AF', // Darker blue
        '#BE185D'  // Darker pink
      ],
      borderWidth: 0,
      cutout: '60%',
      spacing: 2
    }]
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 7,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: calculateYAxisMax(),
        ticks: {
          stepSize: 1,
          maxTicksLimit: 11,
          callback: function(value) {
            return value;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4,
        cubicInterpolationMode: 'monotone'
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOut',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 100 + context.datasetIndex * 100;
        }
        return delay;
      }
    }
  };

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
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
      easing: 'easeOut',
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 150;
        }
        return delay;
      }
    }
  };

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
    return currentUser.name || "Admin";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-5">
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
              {syncing && (
                <div className="text-gray-500 text-sm flex items-center">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                  Syncing...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaBell className="mr-2 text-yellow-500" />
                System Alerts
              </h3>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <ModernAlert
                  key={index}
                  type={alert.type === 'danger' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                  title={alert.type === 'danger' ? 'Outbreak Alert' : alert.type === 'warning' ? 'System Warning' : 'System Info'}
                  message={alert.message}
                  onClose={() => setAlerts(prev => prev.filter((_, i) => i !== index))}
                  autoHide={true}
                  duration={5000}
                  action={alert.count && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-gray-800">
                      {alert.count} cases
                    </span>
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Essential Statistics Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="modern-summary-card"
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="modern-icon-container bg-blue-50">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center space-x-2">
                  <p className="modern-card-label">Total Patients</p>
                </div>
                <p className="modern-card-value">
                  <CountUp end={stats.total_patients} duration={2000} />
                </p>
                <p className="modern-card-description">Registered patients</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="modern-summary-card"
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="modern-icon-container bg-red-50">
                  <FaVirus className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center space-x-2">
                  <p className="modern-card-label">Diseases Tracked</p>
                </div>
                <p className="modern-card-value">
                  <CountUp end={stats.total_diseases} duration={2000} />
                </p>
                <p className="modern-card-description">Active diseases</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="modern-summary-card"
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="modern-icon-container bg-orange-50">
                  <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center space-x-2">
                  <p className="modern-card-label">Active Cases</p>
                </div>
                <p className="modern-card-value">
                  <CountUp end={stats.active_cases} duration={2000} />
                </p>
                <p className="modern-card-description">Current patients</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="modern-summary-card"
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="modern-icon-container bg-green-50">
                  <FaUserMd className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center space-x-2">
                  <p className="modern-card-label">New This Month</p>
                </div>
                <p className="modern-card-value">
                  <CountUp end={stats.new_patients_this_month} duration={2000} />
                </p>
                <p className="modern-card-description">New patients</p>
              </div>
            </div>
          </motion.div>

        </motion.div>


        {/* Charts Row */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Dynamic Trends Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Trends Analysis
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTimeframeChange('weekly')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedTimeframe === 'weekly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => handleTimeframeChange('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedTimeframe === 'monthly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleTimeframeChange('quarterly')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedTimeframe === 'quarterly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => handleTimeframeChange('yearly')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedTimeframe === 'yearly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="h-64">
              <Line 
                key={`trends-chart-${selectedTimeframe}`}
                data={trendsChartData} 
                options={chartOptions} 
              />
            </div>
          </motion.div>

          {/* Age Distribution Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartPie className="mr-2 text-green-600" />
              Age Distribution
            </h3>
            <div className="h-64">
              <Doughnut data={ageChartData} options={doughnutOptions} />
            </div>
          </motion.div>
        </motion.div>

        {/* Disease by Barangay and Growth Rate Trend */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Disease by Barangay Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-purple-600" />
              Top Barangays (Most Cases)
            </h3>
            <div className="h-64">
              {top_locations && top_locations.length > 0 ? (
                <Bar 
                  data={{
                    labels: top_locations.slice(0, 5).map(loc => loc.address.split(',')[0] || loc.address),
                    datasets: [{
                      label: 'Disease Cases',
                      data: top_locations.slice(0, 5).map(loc => loc.patient_count),
                      backgroundColor: '#8B5CF6',
                      borderColor: '#7C3AED',
                      borderWidth: 1,
                      borderRadius: 6
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                          label: (context) => `${context.parsed.x} patients`
                        }
                      }
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No barangay data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Disease Growth Rate Trend */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-red-600" />
              Disease Growth Rate Trend
            </h3>
            <div className="h-64">
              {trends_data && trends_data.length > 1 ? (
                <Line 
                  data={{
                    labels: trends_data.map((item, index) => {
                      if (selectedTimeframe === 'weekly') {
                        return new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      }
                      return item.date;
                    }),
                    datasets: [{
                      label: 'Growth Rate (%)',
                      data: trends_data.map((item, index) => {
                        if (index === 0) return 0;
                        const current = parseInt(item.cases);
                        const previous = parseInt(trends_data[index - 1].cases);
                        if (previous === 0) return 0;
                        return (((current - previous) / previous) * 100).toFixed(1);
                      }),
                      borderColor: '#EF4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      pointBackgroundColor: '#EF4444',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      borderWidth: 3
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                          label: (context) => {
                            const value = parseFloat(context.parsed.y);
                            const sign = value >= 0 ? '+' : '';
                            return `Growth: ${sign}${value}%`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45,
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Insufficient data for growth rate calculation
                </div>
              )}
            </div>
            {/* Growth Rate Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Positive: Cases Increasing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Negative: Cases Decreasing</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Monthly Disease Comparison and Top Diseases */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Monthly Disease Comparison */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-orange-600" />
              Disease Comparison (This Month)
            </h3>
            <div className="h-64">
              {disease_stats && disease_stats.length > 0 ? (
                <Bar 
                  data={{
                    labels: disease_stats.slice(0, 5).map(d => d.disease),
                    datasets: [{
                      label: 'Cases',
                      data: disease_stats.slice(0, 5).map(d => d.case_count),
                      backgroundColor: [
                        '#3B82F6',
                        '#EF4444',
                        '#10B981',
                        '#F59E0B',
                        '#8B5CF6'
                      ],
                      borderColor: [
                        '#1E40AF',
                        '#DC2626',
                        '#059669',
                        '#D97706',
                        '#7C3AED'
                      ],
                      borderWidth: 1,
                      borderRadius: 6
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                          label: (context) => `${context.parsed.y} cases`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No disease data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Diseases */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-red-600" />
              Top Diseases
            </h3>
            <div className="space-y-3">
              {disease_stats.length > 0 ? (
                disease_stats.map((disease, index) => {
                  // Calculate trend using real historical data
                  const trend = calculateTrend(disease.disease, disease.case_count);
                  const trendDisplay = getTrendDisplay(trend);
                  const TrendIcon = trendDisplay.icon;
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-red-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{disease.disease}</p>
                          <p className="text-sm text-gray-500">{disease.unique_patients} patients</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{disease.case_count}</p>
                          <p className="text-xs text-gray-500">cases</p>
                        </div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${trendDisplay.bgColor} transition-all duration-200`}>
                          <TrendIcon className={`text-sm ${trendDisplay.color}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No disease data available</p>
              )}
            </div>
          </motion.div>

        </motion.div>

        {/* Recent Activities */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Recent Activities */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaClock className="mr-2 text-green-600" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {recent_activities.length > 0 ? (
                recent_activities.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {activity.disease ? `Disease: ${activity.disease}` : 'Health checkup'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.last_visit || activity.patient_created).toLocaleDateString()}
                      </p>
                    </div>
                    <FaClock className="h-4 w-4 text-gray-400" />
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Consultations */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            variants={chartVariants}
            whileHover={{ 
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-teal-600" />
              Recent Consultations (Last 7 Days)
            </h3>
            <div className="space-y-3">
              {recent_consultations.length > 0 ? (
                recent_consultations.map((consultation, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{consultation.full_name}</p>
                      <p className="text-xs text-gray-500">
                        Diagnosis: {consultation.diagnosis || 'No diagnosis'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {consultation.chief_complaint ? `Complaint: ${consultation.chief_complaint}` : 'No complaint recorded'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(consultation.date_of_consultation).toLocaleDateString()}
                      </p>
                    </div>
                    <FaClock className="h-4 w-4 text-gray-400" />
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent consultations</p>
              )}
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Modern Toast Notification */}
      {toast && (
        <ModernToast
          isVisible={true}
          title={toast.type === 'success' ? 'Success!' : toast.type === 'error' ? 'Error' : 'Notice'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default Dashboard;
