import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaEye, FaTrash, FaDownload, FaSpinner, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import DeleteModal from './DeleteModal';
import Toast from './Toast';

const RecentForecasts = ({ refreshTrigger }) => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedForecast, setExpandedForecast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    fetchRecentForecasts();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchRecentForecasts();
    }
  }, [refreshTrigger]);

  const fetchRecentForecasts = async () => {
    try {
      const response = await fetch('http://localhost/prms/prms-backend/get_recent_forecasts.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
            
      if (data.success) {
        setForecasts(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch recent forecasts');
        setForecasts([]);
      }
    } catch (err) {
      setError(err.message);
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, title, message) => {
    setToast({ isVisible: true, type, title, message });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      'Chickenpox': 'bg-red-100 text-red-700',
      'Dengue': 'bg-orange-100 text-orange-700',
      'Hepatitis': 'bg-yellow-100 text-yellow-700',
      'Measles': 'bg-green-100 text-green-700',
      'Tuberculosis': 'bg-purple-100 text-purple-700',
      'All Diseases': 'bg-blue-100 text-blue-700'
    };
    return colors[disease] || 'bg-gray-100 text-gray-700';
  };

  // Action Functions
  const handleViewDetails = (forecast) => {
    setExpandedForecast(expandedForecast === forecast.id ? null : forecast.id);
  };

  const handleDownloadReport = async (forecast) => {
    try {
      // Create a comprehensive report
      const reportData = {
        forecast_id: forecast.id,
        disease: forecast.disease,
        forecast_period: forecast.forecast_period,
        generated_at: forecast.generated_at,
        forecast_results: forecast.forecast_results,
        indicators: forecast.indicators
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arima_forecast_${forecast.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show modern toast notification
      showToast('success', 'Download Complete!', `Forecast report downloaded successfully!`);
    } catch (error) {
      showToast('error', 'Download Failed', `Error downloading report: ${error.message}`);
    }
  };

  const handleDeleteForecast = async (forecastId) => {
    try {
      console.log('Attempting to delete forecast ID:', forecastId);
      
      // Call delete API endpoint
      const response = await fetch(`http://localhost/prms/prms-backend/delete_forecast.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forecast_id: forecastId })
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (data.success) {
        // Remove from local state
        setForecasts(prev => prev.filter(forecast => forecast.id !== forecastId));
        setShowDeleteModal(null);
        
        // Refetch data to ensure consistency
        await fetchRecentForecasts();
        
        // Show modern toast notification
        showToast('success', 'Forecast Deleted!', 'Forecast has been successfully deleted.');
      } else {
        throw new Error(data.error || 'Failed to delete forecast');
      }
    } catch (error) {
      showToast('error', 'Delete Failed', `Error deleting forecast: ${error.message}`);
    }
  };

  const handleViewAllResults = (forecast) => {
    setExpandedForecast(expandedForecast === forecast.id ? null : forecast.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading recent forecasts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <div className="text-red-600 mr-3 text-xl">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Forecasts</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="text-center py-16">
        <FaChartLine className="mx-auto text-gray-300 text-6xl mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recent Forecasts</h3>
        <p className="text-gray-500 mb-6">Generate your first ARIMA forecast to see it here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaChartLine className="text-blue-600" />
            Recent Forecasts
          </h2>
          <p className="text-gray-600 mt-1">View and manage your ARIMA disease forecasts</p>
        </div>
      </div>

      {/* Recent Forecasts List Section */}
      <div className="space-y-4">
        {forecasts && forecasts.map((forecast, index) => (
          <div key={forecast.id} className="bg-white shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Disease Name with Colored Pill */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDiseaseColor(forecast.disease)}`}>
                      {forecast.disease}
                    </span>
                    <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                      {forecast.forecast_period} months
                    </span>
                    {/* Forecast Type Badge */}
                    {forecast.forecast_type === 'barangay' ? (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" />
                        Barangay-Level
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <FaChartLine className="w-3 h-3" />
                        Overall
                      </span>
                    )}
                  </div>
                  
                  {/* Generated Time */}
                  <div className="flex items-center text-gray-500 text-xs">
                    <FaCalendarAlt className="mr-2" />
                    Generated: {formatDate(forecast.generated_at)}
                  </div>
                </div>

                {/* Action Icons - Top Right */}
                <div className="flex items-center space-x-3 text-gray-400">
                  <button
                    onClick={() => handleViewDetails(forecast)}
                    className="p-2 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDownloadReport(forecast)}
                    className="p-2 hover:text-green-600 transition-colors"
                    title="Download Report"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(forecast.id)}
                    className="p-2 hover:text-red-600 transition-colors"
                    title="Delete Forecast"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>

            {/* Forecast Results Section */}
            {forecast.forecast_results && forecast.forecast_results.length > 0 && (
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Forecast Results</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Show all results if expanded, otherwise show first 6 */}
                  {(expandedForecast === forecast.id 
                    ? forecast.forecast_results 
                    : forecast.forecast_results.slice(0, 6)
                  ).map((result, resultIndex) => {
                    const colors = getDiseaseColor(result.disease_name);
                    const isBarangayForecast = forecast.forecast_type === 'barangay';
                    
                    return (
                      <div key={resultIndex} className={`${colors} border border-gray-200 rounded-lg p-3 text-sm font-medium hover:shadow-md transition-all`}>
                        <div className="font-semibold capitalize mb-1">
                          {result.disease_name}
                        </div>
                        {/* Show barangay name for barangay-level forecasts */}
                        {isBarangayForecast && result.barangay_name && (
                          <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {result.barangay_name}
                          </div>
                        )}
                        <div className="text-xs opacity-75 mb-1">
                          {result.forecast_month}
                        </div>
                        <div className="font-bold">
                          {Math.round(result.forecast_cases)} predicted cases
                        </div>
                        {/* Show trend for barangay forecasts */}
                        {isBarangayForecast && result.trend && (
                          <div className={`text-xs mt-1 font-medium ${
                            result.trend === 'increasing' ? 'text-red-600' :
                            result.trend === 'decreasing' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {result.trend === 'increasing' ? '↑' : result.trend === 'decreasing' ? '↓' : '→'} {result.trend}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Show expand/collapse button only if there are more than 6 results */}
                  {forecast.forecast_results.length > 6 && (
                    <button
                      onClick={() => handleViewAllResults(forecast)}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-center text-gray-500 hover:bg-blue-50 transition-colors"
                    >
                      {expandedForecast === forecast.id ? (
                        <>
                          <div className="font-semibold text-gray-700">
                            Show less
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Click to collapse
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-gray-700">
                            +{forecast.forecast_results.length - 6} more results
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Click to view all
                          </div>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Divider between forecasts */}
            {forecasts && index < forecasts.length - 1 && (
              <div className="border-t border-gray-100"></div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 py-4">
        Showing {forecasts ? forecasts.length : 0} recent forecast{forecasts && forecasts.length !== 1 ? 's' : ''}
      </div>

      {/* Delete Modal - Now using Portal */}
      <DeleteModal
        isVisible={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDeleteForecast}
        forecastId={showDeleteModal}
      />

      {/* Modern Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={4000}
      />
    </div>
  );
};

export default RecentForecasts;