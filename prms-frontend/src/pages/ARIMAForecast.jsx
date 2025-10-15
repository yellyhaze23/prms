import React, { useState, useEffect } from 'react';
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
  FaFileImage
} from 'react-icons/fa';
import RecentForecasts from '../components/RecentForecasts';
import ForecastChart from '../components/ForecastChart';
import ModernToast from '../components/ModernToast';
import notificationService from '../utils/notificationService';

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

  const diseases = [
    'Chickenpox', 'Dengue', 'Hepatitis', 'Measles', 'Tuberculosis'
  ];

  // Note: Historical data is now included in forecast response as training_data
  // No separate fetch needed - training data comes with forecast results

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
    setLoadingStep('Preparing data...');

    try {
      // Simulate loading steps for better UX
      setLoadingStep('Loading historical data...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Training ARIMA model...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingStep('Generating forecast...');
      
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
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setForecastData(data.data);
        setShowCharts(true);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        {/* Modern Header with Controls */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Disease Forecasting</h1>
              <p className="text-gray-700 mt-2">Generate ARIMA-based disease forecasts</p>
            </div>
            
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
        </div>

        {activeTab === 'generate' && (
          <div className="space-y-8">
            {/* Forecast Parameters Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Forecast Parameters
              </h2>
              
              {/* Form Layout - 3 columns: 2 fields + 1 button group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Disease Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disease (Optional)
                  </label>
                  <select
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Diseases</option>
                    {diseases.map((disease) => (
                      <option key={disease} value={disease}>
                        {disease}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Forecast Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forecast Period (months)
                  </label>
                  <input
                    type="number"
                    value={forecastPeriod}
                    onChange={(e) => setForecastPeriod(Math.max(1, parseInt(e.target.value)))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Action Buttons - Aligned with form fields */}
                <div className="flex flex-col justify-end">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleGenerateForecast}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <FaSync className="animate-spin" /> {loadingStep || 'Generating...'}
                        </>
                      ) : (
                        <>
                          <FaPlay /> Generate
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-all"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
                  <div className="flex flex-col items-center space-y-4">
                    <FaSync className="animate-spin text-4xl text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Generating Forecast</h3>
                    <p className="text-gray-600">{loadingStep}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-sm text-gray-500">This may take a few moments...</p>
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
                        <p className="text-2xl font-bold text-blue-900">{forecastData.summary.total_diseases}</p>
                      </div>
                      <FaUsers className="text-blue-500 text-3xl" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Forecast Months</p>
                        <p className="text-2xl font-bold text-green-900">{forecastData.summary.total_forecast_months}</p>
                      </div>
                      <FaCalendarAlt className="text-green-500 text-3xl" />
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Records</p>
                        <p className="text-2xl font-bold text-orange-900">{forecastData.summary.historical_records}</p>
                      </div>
                      <FaChartLine className="text-orange-500 text-3xl" />
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Current Cases (30d)</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {forecastData.summary.current_cases_30d && Object.keys(forecastData.summary.current_cases_30d).length > 0
                            ? Object.values(forecastData.summary.current_cases_30d).reduce((sum, count) => sum + count, 0)
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
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <RecentForecasts />
          </div>
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
    </div>
  );
};

export default ARIMAForecast;