import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaUsers, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaPlay,
  FaDownload,
  FaSync,
  FaEye,
  FaFileImage,
  FaChevronDown
} from 'react-icons/fa';
import RecentForecasts from '../components/RecentForecasts';
import ForecastChart from '../components/ForecastChart';
import ModernToast from '../components/ModernToast';
import CountUp from '../components/CountUp';
import notificationService from '../utils/notificationService';
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  chartVariants,
  buttonVariants,
  hoverScale 
} from '../utils/animations';

const ARIMAForecast = () => {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [error, setError] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [toast, setToast] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [progress, setProgress] = useState(0);
  const dropdownRef = useRef(null);

  const diseases = [
    'Chickenpox', 'Dengue', 'Hepatitis', 'Measles', 'Tuberculosis'
  ];

  // Dropdown options
  const dropdownOptions = [
    { value: '', label: 'All Diseases' },
    ...diseases.map(disease => ({ value: disease, label: disease }))
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected option
  const selectedOption = dropdownOptions.find(option => option.value === selectedDisease) || dropdownOptions[0];

  // Fetch historical data for chart visualization
  const fetchHistoricalData = async (disease, months = 12) => {
    try {
      const response = await fetch(`http://localhost/prms/prms-backend/get_historical_disease_data.php?disease=${encodeURIComponent(disease || '')}&months=${months}`);
      const data = await response.json();
      
      if (data.success) {
        setHistoricalData(data.historical_data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Function to get color scheme for each disease
  const getDiseaseColor = (diseaseName) => {
    const colorMap = {
      'Chickenpox': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        textDark: 'text-red-900',
        border: 'border-red-200'
      },
      'Dengue': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        textDark: 'text-orange-900',
        border: 'border-orange-200'
      },
      'Hepatitis': {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        textDark: 'text-yellow-900',
        border: 'border-yellow-200'
      },
      'Measles': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        textDark: 'text-green-900',
        border: 'border-green-200'
      },
      'Tuberculosis': {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        textDark: 'text-purple-900',
        border: 'border-purple-200'
      }
    };
    
    return colorMap[diseaseName] || {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      textDark: 'text-blue-900',
      border: 'border-blue-200'
    };
  };

  const handleGenerateForecast = async () => {
    setIsLoading(true);
    setError('');
    setProgress(0);
    setLoadingStep('Preparing data...');

    try {
      // Simulate loading steps for better UX
      setLoadingStep('Loading historical data...');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Training ARIMA model...');
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Generating forecast...');
      setProgress(75);
      
      const response = await fetch('http://localhost/prms/prms-backend/arima_forecast_disease_summary.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disease: selectedDisease || null,
          forecast_period: forecastPeriod
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setLoadingStep('Finalizing results...');
        setProgress(90);
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(100);
        
        setForecastData(data.data);
        setShowCharts(true);
        
        // Fetch historical data for chart visualization
        await fetchHistoricalData(selectedDisease, 12);
        setToast({
          isVisible: true,
          type: 'success',
          title: 'Forecast Generated!',
          message: 'ARIMA forecast completed successfully!'
        });
        
        // Send notification
        try {
          await notificationService.notifyForecastGenerated(
            selectedDisease || 'All Diseases'
          );
        } catch (error) {
          console.error('Error sending notification:', error);
        }
        
        // Trigger refresh of RecentForecasts component
        setRefreshTrigger(prev => prev + 1);
        
        // Training data is now included in forecast response
      } else {
        setError(data.error || 'Failed to generate forecast');
        setToast({
          isVisible: true,
          type: 'error',
          title: 'Forecast Failed!',
          message: data.error || 'Failed to generate forecast'
        });
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Connection Error!',
        message: `Error: ${err.message}`
      });
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      setProgress(0);
    }
  };

  const handleDownloadReport = () => {
    if (!forecastData) return;
    
    // Create CSV content
    const csvHeader = 'Disease,Forecast Month,Predicted Cases,Generated At\n';
    const csvRows = forecastData.forecast_results.map(result => 
      `"${result.disease_name}","${result.forecast_month}",${Math.round(result.forecast_cases)},"${new Date().toISOString()}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arima_forecast_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        {/* Modern Header with Controls */}
        <motion.div 
          className="mb-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div variants={cardVariants}>
              <h1 className="text-3xl font-bold text-blue-600">Disease Forecasting</h1>
              <p className="text-gray-700 mt-2">Generate ARIMA-based disease forecasts</p>
            </motion.div>
            
            {/* Controls on the right */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaInfoCircle />
                <span>ARIMA Model</span>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaPlay className="inline mr-2" />
                Generate Forecast
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCalendarAlt className="inline mr-2" />
                Recent Forecasts
              </button>
            </nav>
          </div>
        </motion.div>

        {activeTab === 'generate' && (
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Forecast Parameters Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300"
              variants={cardVariants}
              whileHover={hoverScale}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Forecast Parameters</h2>
                  <p className="text-gray-600 text-sm">Configure your disease forecasting model</p>
                </div>
              </div>
              
              {/* Form Layout - 3 columns: 2 fields + 1 button group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Disease Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Disease (Optional)
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 flex items-center justify-between text-left"
                    >
                      <span className="text-gray-900 font-medium">{selectedOption.label}</span>
                      <FaChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {dropdownOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedDisease(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between ${
                              selectedDisease === option.value 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'text-gray-700 hover:text-blue-700'
                            }`}
                          >
                            <span>{option.label}</span>
                            {selectedDisease === option.value && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Forecast Period */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Forecast Period (months)
                  </label>
                  <input
                    type="number"
                    value={forecastPeriod}
                    onChange={(e) => setForecastPeriod(Math.max(1, parseInt(e.target.value)))}
                    min="1"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium"
                    placeholder="Enter months..."
                  />
                </div>

                {/* Action Buttons - Aligned with form fields */}
                <div className="flex flex-col justify-end">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleGenerateForecast}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <FaPlay className="w-5 h-5" /> 
                      <span>Generate</span>
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-3 transition-all duration-200 font-medium"
                    >
                      <FaDownload className="w-5 h-5" /> 
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <strong className="font-bold">Error!</strong>
                  <span className="ml-2">{error}</span>
                </div>
              </div>
            )}

            {/* Enhanced Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-lg mx-4 text-center shadow-2xl border border-white/20">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Modern Loading Icon */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <FaSync className="animate-spin text-2xl text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 animate-ping"></div>
                    </div>
                    
                    {/* Title and Status */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">Generating Forecast</h3>
                      <p className="text-lg text-gray-700 font-medium">{loadingStep}</p>
                    </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="w-full space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Processing...</span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                    
                    {/* Modern Info Text */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-blue-700 font-medium">
                        <FaInfoCircle className="inline w-4 h-4 mr-2" />
                        This may take a few moments while we analyze your data...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Forecast Results Section */}
            {forecastData ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Forecast Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Diseases</p>
                        <p className="text-2xl font-bold text-blue-900">
                          <CountUp end={forecastData.summary.total_diseases} duration={2000} />
                        </p>
                      </div>
                      <FaUsers className="text-blue-500 text-3xl" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Forecast Months</p>
                        <p className="text-2xl font-bold text-green-900">
                          <CountUp end={forecastData.summary.total_forecast_months} duration={2000} />
                        </p>
                      </div>
                      <FaCalendarAlt className="text-green-500 text-3xl" />
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Records</p>
                        <p className="text-2xl font-bold text-orange-900">
                          <CountUp end={forecastData.summary.historical_records} duration={2000} />
                        </p>
                      </div>
                      <FaChartLine className="text-orange-500 text-3xl" />
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Current Cases (30d)</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {forecastData.summary.current_cases_30d && Object.keys(forecastData.summary.current_cases_30d).length > 0
                            ? <CountUp end={Object.values(forecastData.summary.current_cases_30d).reduce((sum, count) => sum + count, 0)} duration={2000} />
                            : 'N/A'}
                        </p>
                      </div>
                      <FaMapMarkerAlt className="text-purple-500 text-3xl" />
                    </div>
                  </div>
                </div>

                {/* Current Cases (Last 30 Days) */}
                {forecastData.summary.current_cases_30d && Object.keys(forecastData.summary.current_cases_30d).length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Cases (Last 30 Days)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(forecastData.summary.current_cases_30d).map(([disease, count]) => {
                        const colors = getDiseaseColor(disease);
                        return (
                          <div key={disease} className={`${colors.bg} ${colors.border} border p-4 rounded-xl hover:shadow-lg transition-all`}>
                            <p className={`font-semibold ${colors.textDark} capitalize`}>{disease}: {count} cases</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Forecast Results - Now with Disease-Specific Colors and Accuracy Metrics */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Forecast Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forecastData.forecast_results.map((result, index) => {
                      const colors = getDiseaseColor(result.disease_name);
                      return (
                        <div key={index} className={`${colors.bg} p-4 rounded-xl shadow-sm hover:shadow-lg transition-all border ${colors.border}`}>
                          <p className={`text-sm ${colors.text} capitalize font-medium`}>{result.disease_name}</p>
                          <p className={`text-lg font-semibold ${colors.textDark} mt-1`}>{result.forecast_month}</p>
                          <p className={`text-2xl font-bold ${colors.textDark} mt-2`}>
                            {result.forecast_cases} 
                            <span className={`text-lg font-normal ${colors.text} ml-1`}>predicted cases</span>
                          </p>
                          
                          {/* Accuracy Metrics */}
                          {(result.accuracy_rmse > 0 || result.accuracy_mape > 0) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between text-xs">
                                <span className={`${colors.text}`}>RMSE: {result.accuracy_rmse?.toFixed(2) || 'N/A'}</span>
                                <span className={`${colors.text}`}>MAPE: {result.accuracy_mape?.toFixed(1) || 'N/A'}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Forecast Chart */}
                {forecastData && (
                  <div className="mt-6">
                    <React.Suspense fallback={
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="text-center text-gray-500">
                          <FaChartLine className="text-4xl mx-auto mb-4 text-gray-300 animate-pulse" />
                          <p>Loading chart...</p>
                        </div>
                      </div>
                    }>
                      <ForecastChart
                        forecastData={forecastData.forecast_results}
                        historicalData={historicalData}
                        diseaseName={selectedDisease}
                        forecastPeriod={forecastPeriod}
                      />
                    </React.Suspense>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Forecast Generated
                </h3>
                <p className="text-gray-600">
                  Click "Generate Forecast" to create ARIMA-based disease predictions
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'recent' && (
          <motion.div 
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={hoverScale}
          >
            <RecentForecasts refreshTrigger={refreshTrigger} />
          </motion.div>
        )}
      </div>

      {/* Modern Toast Notifications */}
      {toast && (
        <ModernToast
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          type={toast.type}
          title={toast.title}
          message={toast.message}
        />
      )}
    </motion.div>
  );
};

export default ARIMAForecast;