import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEye,
  FaDownload,
  FaSpinner,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import ForecastChart from '../../components/ForecastChart';
import ModernToast from '../../components/ModernToast';
import CountUp from '../../components/CountUp';
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../../utils/animations';

const StaffARIMAForecast = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedForecast, setExpandedForecast] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const diseases = ['All', 'Chickenpox', 'Dengue', 'Hepatitis', 'Measles', 'Tuberculosis'];

  const fetchRecentForecasts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/prms-backend/get_recent_forecasts.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
            
      if (data.success) {
        setForecasts(data.data || []);
      } else {
        setToast({
          type: 'error',
          message: data.error || 'Failed to fetch recent forecasts'
        });
        setForecasts([]);
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Error loading forecasts: ' + err.message
      });
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRecentForecasts();
    
    // Smart refresh: fetch when user comes back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRecentForecasts();
      }
    };
    
    // Smart refresh: fetch when window gains focus
    const handleFocus = () => {
      fetchRecentForecasts();
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchRecentForecasts]);

  const handleViewDetails = (forecast) => {
    setExpandedForecast(expandedForecast?.id === forecast.id ? null : forecast);
  };

  const handleDownloadCSV = (forecast) => {
    try {
      const csvHeader = 'Disease,Forecast Month,Predicted Cases,Generated At\n';
      const csvRows = forecast.predictions.map(p => 
        `${forecast.disease},${p.month},${p.cases},${forecast.generated_at}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast_${forecast.disease}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setToast({
        type: 'success',
        message: `Forecast data downloaded successfully!`
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Failed to download forecast data'
      });
    }
  };

  // Function to get color scheme for each disease
  const getDiseaseColor = (diseaseName) => {
    const colorMap = {
      'Chickenpox': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800',
        border: 'border-red-200'
      },
      'Dengue': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800',
        border: 'border-orange-200'
      },
      'Hepatitis': {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800',
        border: 'border-yellow-200'
      },
      'Measles': {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-800',
        border: 'border-purple-200'
      },
      'Tuberculosis': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800',
        border: 'border-blue-200'
      }
    };
    
    return colorMap[diseaseName] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800',
      border: 'border-gray-200'
    };
  };

  // Filter and sort forecasts
  const getFilteredForecasts = () => {
    let filtered = [...forecasts];

    // Filter by disease
    if (selectedDisease !== 'all') {
      filtered = filtered.filter(f => 
        f.disease.toLowerCase() === selectedDisease.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.generated_at) - new Date(b.generated_at));
    } else if (sortBy === 'disease') {
      filtered.sort((a, b) => a.disease.localeCompare(b.disease));
    }

    return filtered;
  };

  const filteredForecasts = getFilteredForecasts();

  return (
    <motion.div 
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-3">
              <FaChartLine className="text-blue-500" />
              ARIMA Disease Forecasts
            </h1>
            <p className="text-gray-700 mt-2">View generated disease predictions</p>
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div 
          variants={cardVariants}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
        >
          <FaInfoCircle className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Read-Only Access</h3>
            <p className="text-sm text-blue-700">
              You can view and download forecasts generated by administrators. 
              To request a new forecast, please contact your administrator.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters & Stats Bar */}
      <motion.div 
        variants={cardVariants}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Forecasts */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forecasts</p>
                <p className="text-2xl font-bold text-blue-600">
                  <CountUp end={forecasts.length} duration={1000} />
                </p>
              </div>
              <FaChartLine className="text-3xl text-blue-500" />
            </div>
          </div>

          {/* Disease Filter */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Disease
            </label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Diseases</option>
              {diseases.filter(d => d !== 'All').map(disease => (
                <option key={disease} value={disease}>{disease}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="disease">Disease Name</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Forecasts List */}
      <motion.div variants={containerVariants}>
        {loading ? (
          <motion.div 
            variants={cardVariants}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-16 text-center"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
            <p className="text-xl font-semibold text-blue-900">Loading forecasts...</p>
            <p className="text-sm text-blue-600 mt-2">Please wait while we fetch the data</p>
          </motion.div>
        ) : filteredForecasts.length === 0 ? (
          <motion.div 
            variants={cardVariants}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Forecasts Available</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {selectedDisease !== 'all' 
                  ? `No forecasts found for ${selectedDisease}. Try changing the filter above.`
                  : 'No forecasts have been generated yet. Please contact your administrator to generate forecasts.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredForecasts.map((forecast, index) => {
              const colors = getDiseaseColor(forecast.disease);
              const isExpanded = expandedForecast?.id === forecast.id;
              
              return (
                <motion.div
                  key={forecast.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Compact Forecast Card */}
                  <div className={`${colors.bg} px-4 py-3 border-b ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaChartLine className={`text-xl ${colors.text}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-bold ${colors.text}`}>
                              {forecast.disease}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}>
                              {forecast.predictions?.length || 0} {forecast.predictions?.length === 1 ? 'Month' : 'Months'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <FaCalendarAlt className="text-gray-400 text-xs" />
                              <span>
                                {new Date(forecast.generated_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-gray-400">at</span>
                              <span>
                                {new Date(forecast.generated_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {forecast.forecast_type === 'barangay' && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                <FaMapMarkerAlt className="text-xs" />
                                <span className="text-xs font-semibold">Barangay-Level</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetails(forecast)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
                        >
                          {isExpanded ? (
                            <>
                              <FaTimes />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <FaEye />
                              View Details
                            </>
                          )}
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadCSV(forecast)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
                        >
                          <FaDownload />
                          Export
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Forecast Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 border-t"
                    >
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium">Total Predicted Cases</p>
                          <p className="text-2xl font-bold text-blue-900">
                            <CountUp 
                              end={forecast.predictions?.reduce((sum, p) => sum + parseInt(p.cases), 0) || 0} 
                              duration={2000} 
                            />
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-700 font-medium">Forecast Period</p>
                          <p className="text-2xl font-bold text-green-900">
                            {forecast.predictions?.length || 0} Months
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-700 font-medium">Average Cases/Month</p>
                          <p className="text-2xl font-bold text-purple-900">
                            <CountUp 
                              end={Math.round((forecast.predictions?.reduce((sum, p) => sum + parseInt(p.cases), 0) || 0) / (forecast.predictions?.length || 1))} 
                              duration={2000} 
                            />
                          </p>
                        </div>
                      </div>

                      {/* Predictions Table */}
                      <div className="bg-white rounded-lg border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Month
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Predicted Cases
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trend
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {forecast.predictions?.map((prediction, idx) => {
                              const prevCases = idx > 0 ? parseInt(forecast.predictions[idx - 1].cases) : null;
                              const currentCases = parseInt(prediction.cases);
                              const trend = prevCases === null ? 'baseline' 
                                : currentCases > prevCases ? 'increasing'
                                : currentCases < prevCases ? 'decreasing'
                                : 'stable';
                              
                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {prediction.month}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="font-bold text-lg">{prediction.cases}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {trend === 'increasing' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        ↑ Increasing
                                      </span>
                                    )}
                                    {trend === 'decreasing' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ↓ Decreasing
                                      </span>
                                    )}
                                    {trend === 'stable' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        → Stable
                                      </span>
                                    )}
                                    {trend === 'baseline' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Baseline
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modern Toast Notification */}
      {toast && (
        <ModernToast
          isVisible={true}
          title={toast.type === 'success' ? 'Success!' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </motion.div>
  );
};

export default StaffARIMAForecast;


