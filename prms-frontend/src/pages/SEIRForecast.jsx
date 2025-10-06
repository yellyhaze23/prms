import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaVirus, 
  FaShieldAlt,
  FaInfoCircle,
  FaSync
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function SEIRForecast() {
  const [selectedDisease, setSelectedDisease] = useState('Dengue');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecastDays, setForecastDays] = useState(30);
  const [population, setPopulation] = useState(10000);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [recentForecasts, setRecentForecasts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const diseases = ['Chickenpox', 'Measles', 'Tuberculosis', 'Hepatitis', 'Dengue'];

  // Helper function to get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch recent forecasts on component mount
  useEffect(() => {
    fetchRecentForecasts();
  }, []);

  // Remove auto-refresh - users must click "Generate Forecast" button
  // useEffect(() => {
  //   fetchForecastData();
  // }, [selectedDisease, forecastDays, population]);

  const fetchRecentForecasts = async () => {
    setLoadingRecent(true);
    try {
      const response = await fetch('http://localhost/prms/prms-backend/get_forecasts.php');
      if (response.ok) {
        const data = await response.json();
        setRecentForecasts(data.forecasts || []);
      }
    } catch (error) {
      console.error('Error fetching recent forecasts:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const viewForecast = (forecast) => {
    // Ensure the forecast data has the expected structure
    const formattedForecast = {
      ...forecast,
      // Use actual interpretation data if available, otherwise provide defaults
      interpretation: forecast.interpretation || {
        risk_assessment: 'Risk assessment data not available',
        peak_prediction: 'Peak prediction data not available',
        reproduction_analysis: 'Reproduction analysis data not available',
        trend_analysis: 'Trend analysis data not available',
        recommendations: ['Recommendations not available']
      },
      // Use actual barangay risk data if available, otherwise provide defaults
      barangay_risk: forecast.barangay_risk || [],
      // Ensure other required fields exist
      seir_results: forecast.seir_results || [],
      indicators: forecast.indicators || {},
      area_data: forecast.area_data || {},
      current_data: forecast.current_data || {}
    };
    
    setForecastData(formattedForecast);
    setSelectedDisease(forecast.disease);
    setForecastDays(forecast.forecast_period);
    setPopulation(forecast.population);
  };

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost/prms/prms-backend/seir_forecast.php?disease=${selectedDisease}&days=${forecastDays}&population=${population}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setForecastData(data);
      
      // Save forecast to database
      try {
        await fetch('http://localhost/prms/prms-backend/save_forecast.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      } catch (saveError) {
        console.error('Error saving forecast:', saveError);
      }
      
      // Show modern toast notification after forecast generation
      setTimeout(() => {
        setToastMessage(`Forecast for ${selectedDisease} (${forecastDays} days) has been successfully generated!`);
        setShowToast(true);
        
        // Auto-hide toast after 4 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 4000);
      }, 500); // Small delay to ensure UI updates first
      
      // Refresh recent forecasts list
      fetchRecentForecasts();
      
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      setError('Failed to load forecast data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white">SEIR Disease Forecasting</h1>
          <p className="text-blue-100 mt-2">SEIR-based forecasting for communicable disease prediction</p>
          <p className="text-blue-200 text-sm mt-1">Based on DOH parameters</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Disease Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Disease</label>
              <select
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {diseases.map(disease => (
                  <option key={disease} value={disease}>{disease}</option>
                ))}
              </select>
            </div>

            {/* Forecast Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period</label>
              <select
                value={forecastDays}
                onChange={(e) => setForecastDays(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            {/* Population */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Population Size</label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1000"
                max="100000"
                step="1000"
              />
            </div>

            {/* Actions */}
            <div className="flex items-end">
              <button
                onClick={fetchForecastData}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaSync className="mr-2" />
                    Generate Forecast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Forecasts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600" />
            Recent Forecasts
          </h3>
          
          {loadingRecent ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading recent forecasts...</span>
            </div>
          ) : recentForecasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentForecasts.slice(0, 6).map((forecast, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{forecast.disease}</h4>
                      <p className="text-sm text-gray-600">{forecast.forecast_period} days</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(forecast.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Population:</span>
                      <span className="font-medium">{forecast.population?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(forecast.indicators?.risk_level || 'Low')}`}>
                        {forecast.indicators?.risk_level || 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Peak Day:</span>
                      <span className="font-medium">Day {forecast.indicators?.peak_day || 0}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => viewForecast(forecast)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <FaChartLine className="mr-2" />
                    View Forecast
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Forecasts</h3>
              <p className="text-gray-600">Generate your first forecast to see it saved here.</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="bg-green-200 rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Success!</h3>
                  <p className="mt-1 text-sm text-gray-600">{toastMessage}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setShowToast(false)}
                    className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating forecast...</span>
          </div>
        ) : forecastData ? (
          <div className="space-y-6">
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUsers className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Cases</p>
                    <p className="text-2xl font-semibold text-gray-900">{forecastData.current_data.total_cases}</p>
                    <p className="text-xs text-gray-500">Real data from database</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaVirus className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Confirmed Cases</p>
                    <p className="text-2xl font-semibold text-red-600">{forecastData.current_data.confirmed_cases}</p>
                    <p className="text-xs text-gray-500">Active infections</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Suspected Cases</p>
                    <p className="text-2xl font-semibold text-yellow-600">{forecastData.current_data.suspected_cases}</p>
                    <p className="text-xs text-gray-500">Under investigation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recovered Cases</p>
                    <p className="text-2xl font-semibold text-green-600">{forecastData.current_data.recovered_cases}</p>
                    <p className="text-xs text-gray-500">Successfully treated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Data Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" />
                Real Data Insights
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Area Population</h4>
                  <p className="text-2xl font-bold text-blue-600">{forecastData.area_data.total_population.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Estimated from patient data</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">New Cases (7d)</h4>
                  <p className="text-2xl font-bold text-orange-600">{forecastData.current_data.new_cases_7d}</p>
                  <p className="text-xs text-gray-500">Recent infections</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">New Cases (30d)</h4>
                  <p className="text-2xl font-bold text-purple-600">{forecastData.current_data.new_cases_30d}</p>
                  <p className="text-xs text-gray-500">Monthly trend</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Average Age</h4>
                  <p className="text-2xl font-bold text-indigo-600">{forecastData.current_data.avg_age || 'N/A'} years</p>
                  <p className="text-xs text-gray-500">Affected population</p>
                </div>
              </div>
            </div>

            {/* Forecast Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Forecast Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Risk Level</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(forecastData.indicators.risk_level)}`}>
                    {forecastData.indicators.risk_level}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Peak Infected</h4>
                  <p className="text-2xl font-bold text-red-600">{forecastData.indicators.peak_infected}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Attack Rate</h4>
                  <p className="text-2xl font-bold text-orange-600">{forecastData.indicators.attack_rate}%</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">R0 (Reproduction Number)</h4>
                  <p className="text-2xl font-bold text-purple-600">{forecastData.indicators.reproduction_number}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Doubling Time</h4>
                  <p className="text-2xl font-bold text-indigo-600">{forecastData.indicators.doubling_time} days</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Peak Day</h4>
                  <p className="text-2xl font-bold text-green-600">Day {forecastData.indicators.peak_day}</p>
                </div>
              </div>
            </div>

            {/* SEIR Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                SEIR Model Data (First 10 Days)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Susceptible</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exposed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Infected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recovered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Infections</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forecastData.seir_results.slice(0, 10).map((day, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Day {day.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.susceptible.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.exposed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.infected.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.recovered.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.new_infections.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disease Progression Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Disease Progression Over Time
              </h3>
              
              <div className="h-96">
                <Line
                  data={{
                    labels: (forecastData.seir_results || []).map(day => `Day ${day.day}`),
                    datasets: [
                      {
                        label: 'Susceptible',
                        data: (forecastData.seir_results || []).map(day => day.susceptible),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: 'Exposed',
                        data: (forecastData.seir_results || []).map(day => day.exposed),
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: 'Infected',
                        data: (forecastData.seir_results || []).map(day => day.infected),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: 'Recovered',
                        data: (forecastData.seir_results || []).map(day => day.recovered),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: 'New Infections',
                        data: (forecastData.seir_results || []).map(day => day.new_infections),
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        fill: false,
                        tension: 0.4,
                        borderDash: [5, 5]
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: `${selectedDisease} Disease Progression Forecast (${forecastDays} days)`,
                        font: {
                          size: 16,
                          weight: 'bold'
                        }
                      },
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 20
                        }
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Days'
                        },
                        grid: {
                          display: true,
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Number of People'
                        },
                        beginAtZero: true,
                        grid: {
                          display: true,
                          color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          callback: function(value) {
                            return value.toLocaleString();
                          }
                        }
                      }
                    },
                    interaction: {
                      mode: 'nearest',
                      axis: 'x',
                      intersect: false
                    }
                  }}
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Chart Explanation:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><span className="text-blue-600">●</span> <strong>Susceptible (Blue):</strong> People who can get infected</li>
                  <li><span className="text-yellow-600">●</span> <strong>Exposed (Yellow):</strong> People infected but not yet infectious</li>
                  <li><span className="text-red-600">●</span> <strong>Infected (Red):</strong> People who are sick and can spread disease</li>
                  <li><span className="text-green-600">●</span> <strong>Recovered (Green):</strong> People who recovered and are immune</li>
                  <li><span className="text-purple-600">●</span> <strong>New Infections (Purple):</strong> Daily new cases (dashed line)</li>
                </ul>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-600" />
                Forecast Interpretation
              </h3>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-700">{forecastData.interpretation?.risk_assessment || 'Risk assessment not available'}</p>
                <p className="text-sm text-gray-700">{forecastData.interpretation?.peak_prediction || 'Peak prediction not available'}</p>
                <p className="text-sm text-gray-700">{forecastData.interpretation?.reproduction_analysis || 'Reproduction analysis not available'}</p>
                <p className="text-sm text-gray-700">{forecastData.interpretation?.trend_analysis || 'Trend analysis not available'}</p>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {(forecastData.interpretation?.recommendations || ['No recommendations available']).map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Barangay Risk Assessment */}
            {forecastData.barangay_risk && forecastData.barangay_risk.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" />
                  Barangay Risk Assessment
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cases</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suspected</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {forecastData.barangay_risk.map((barangay, index) => {
                        const riskLevel = barangay.cases > 5 ? 'High' : barangay.cases > 2 ? 'Moderate' : 'Low';
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {barangay.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {barangay.cases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {barangay.confirmed_cases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {barangay.suspected_cases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}>
                                {riskLevel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Forecast Data</h3>
            <p className="mt-1 text-sm text-gray-500">Select a disease and generate a forecast to view predictions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SEIRForecast;