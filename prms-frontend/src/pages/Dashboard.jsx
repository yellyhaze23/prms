import React, { useState, useEffect } from "react";
import { 
  FaUsers, 
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
  FaChartPie
} from "react-icons/fa";
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (timeframe = selectedTimeframe) => {
    try {
      // Only show loading spinner on initial load, not on auto-refresh
      if (!dashboardData) {
        setLoading(true);
      } else {
        setSyncing(true);
      }
      
      const response = await axios.get(`http://localhost/prms/prms-backend/get_dashboard_data.php?timeframe=${timeframe}`);
      
      if (response.data.success) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(response.data.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
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
      <div className="min-h-screen bg-gray-50 py-6">
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
      <div className="min-h-screen bg-gray-50 py-6">
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

  const { stats, disease_stats, recent_activities, trends_data, current_timeframe, age_distribution, gender_distribution, top_locations, recent_consultations, alerts } = dashboardData;

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

  // Chart data for age distribution
  const ageChartData = {
    labels: age_distribution.map(item => item.age_group),
    datasets: [{
      data: age_distribution.map(item => item.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)'
      ],
      borderWidth: 2
    }]
  };

  // Chart data for gender distribution
  const genderChartData = {
    labels: gender_distribution.map(item => item.sex),
    datasets: [{
      data: gender_distribution.map(item => item.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 2
    }]
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
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
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">RHU Patient Record System</h1>
              <p className="text-blue-100 mt-2">Welcome to the Rural Health Unit Patient Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-blue-100 text-sm">
                  <FaClock className="inline mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              {syncing && (
                <div className="text-blue-100 text-sm flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-100 rounded-full animate-spin mr-2"></div>
                  Syncing...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBell className="mr-2 text-yellow-500" />
              System Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center">
                    {getAlertIcon(alert.type)}
                    <span className="ml-3 font-medium text-gray-900">{alert.message}</span>
                    {alert.count && (
                      <span className="ml-auto bg-white px-3 py-1 rounded-full text-sm font-semibold">
                        {alert.count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Essential Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_patients}</p>
                <p className="text-xs text-gray-500">Registered patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaVirus className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Diseases Tracked</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_diseases}</p>
                <p className="text-xs text-gray-500">Active diseases</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active_cases}</p>
                <p className="text-xs text-gray-500">Current patients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaUserMd className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New This Month</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.new_patients_this_month}</p>
                <p className="text-xs text-gray-500">New patients</p>
              </div>
            </div>
          </div>

        </div>


        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Dynamic Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Trends Analysis
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTimeframeChange('weekly')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeframe === 'weekly'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => handleTimeframeChange('monthly')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeframe === 'monthly'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleTimeframeChange('quarterly')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeframe === 'quarterly'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => handleTimeframeChange('yearly')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeframe === 'yearly'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
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
          </div>

          {/* Age Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartPie className="mr-2 text-green-600" />
              Age Distribution
            </h3>
            <div className="h-64">
              <Doughnut data={ageChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Disease Statistics and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Diseases */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-red-600" />
              Top Diseases
            </h3>
            <div className="space-y-3">
              {disease_stats.length > 0 ? (
                disease_stats.map((disease, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-red-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{disease.disease}</p>
                        <p className="text-sm text-gray-500">{disease.unique_patients} patients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{disease.case_count}</p>
                      <p className="text-xs text-gray-500">cases</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No disease data available</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCog className="mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a href="/patient" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 group">
                <FaUsers className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-blue-800 font-medium">Manage Patients</span>
              </a>
              <a href="/diseases" className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 group">
                <FaStethoscope className="h-6 w-6 text-red-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-red-800 font-medium">Track Diseases</span>
              </a>
              <a href="/records" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 group">
                <FaFileAlt className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-green-800 font-medium">View Records</span>
              </a>
              <a href="/tracker" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 group">
                <FaMapMarkerAlt className="h-6 w-6 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                <span className="text-purple-800 font-medium">Disease Tracker</span>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaClock className="mr-2 text-green-600" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {recent_activities.length > 0 ? (
                recent_activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-teal-600" />
              Recent Consultations (Last 7 Days)
            </h3>
            <div className="space-y-3">
              {recent_consultations.length > 0 ? (
                recent_consultations.map((consultation, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent consultations</p>
              )}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-green-600" />
              Top Locations
            </h3>
            <div className="space-y-3">
              {top_locations.length > 0 ? (
                top_locations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate">{location.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{location.patient_count}</p>
                      <p className="text-xs text-gray-500">patients</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No location data available</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;