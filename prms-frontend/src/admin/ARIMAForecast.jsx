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
  FaChevronDown,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight
} from 'react-icons/fa';
import RecentForecasts from '../components/RecentForecasts';
import SimpleForecastChart from '../components/SimpleForecastChart';
import ActualVsForecastChart from '../components/ActualVsForecastChart';
import BarangayForecastChart from '../components/BarangayForecastChart';
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
  const [error, setError] = useState('');
  const [showCharts, setShowCharts] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [toast, setToast] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [progress, setProgress] = useState(0);
  const dropdownRef = useRef(null);
  
  // NEW: Barangay forecast state
  const [barangayForecastData, setBarangayForecastData] = useState(null);
  const [forecastMode, setForecastMode] = useState('overall'); // 'overall' or 'barangay'
  const [historicalData, setHistoricalData] = useState(null);

  const diseases = [
    'Chickenpox', 'Dengue', 'Hepatitis', 'Measles', 'Tuberculosis'
  ];

  // Load saved forecast data from localStorage on mount
  useEffect(() => {
    try {
      // Load overall forecast data
      const savedOverallForecast = localStorage.getItem('arima_forecast_overall');
      if (savedOverallForecast) {
        const parsed = JSON.parse(savedOverallForecast);
        setForecastData(parsed);
        if (parsed && parsed.forecast_results) {
          setShowCharts(true);
        }
      }

      // Load barangay forecast data
      const savedBarangayForecast = localStorage.getItem('arima_forecast_barangay');
      if (savedBarangayForecast) {
        const parsed = JSON.parse(savedBarangayForecast);
        setBarangayForecastData(parsed);
        if (parsed && parsed.forecast_results) {
          setShowCharts(true);
        }
      }

      // Load forecast mode
      const savedMode = localStorage.getItem('arima_forecast_mode');
      if (savedMode && (savedMode === 'overall' || savedMode === 'barangay')) {
        setForecastMode(savedMode);
      }

      // Load historical data
      const savedHistorical = localStorage.getItem('arima_forecast_historical');
      if (savedHistorical) {
        setHistoricalData(JSON.parse(savedHistorical));
      }
    } catch (error) {
      console.error('Error loading saved forecast data:', error);
    }
  }, []);

  // Save forecast data to localStorage whenever it changes
  useEffect(() => {
    if (forecastData) {
      try {
        localStorage.setItem('arima_forecast_overall', JSON.stringify(forecastData));
      } catch (error) {
        console.error('Error saving overall forecast to localStorage:', error);
      }
    }
  }, [forecastData]);

  useEffect(() => {
    if (barangayForecastData) {
      try {
        localStorage.setItem('arima_forecast_barangay', JSON.stringify(barangayForecastData));
      } catch (error) {
        console.error('Error saving barangay forecast to localStorage:', error);
      }
    }
  }, [barangayForecastData]);

  useEffect(() => {
    if (forecastMode) {
      localStorage.setItem('arima_forecast_mode', forecastMode);
    }
  }, [forecastMode]);

  useEffect(() => {
    if (historicalData) {
      try {
        localStorage.setItem('arima_forecast_historical', JSON.stringify(historicalData));
      } catch (error) {
        console.error('Error saving historical data to localStorage:', error);
      }
    }
  }, [historicalData]);

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

  // Generate statistical interpretations from forecast data
  const generateInterpretations = (forecastData) => {
    if (!forecastData || !forecastData.forecast_results) return null;

    const results = forecastData.forecast_results;
    const summary = forecastData.summary;
    
    // Calculate trends
    const diseaseGroups = {};
    results.forEach(result => {
      if (!diseaseGroups[result.disease_name]) {
        diseaseGroups[result.disease_name] = [];
      }
      diseaseGroups[result.disease_name].push(result.forecast_cases);
    });

    // Find overall trend
    let totalFirstMonth = 0;
    let totalLastMonth = 0;
    Object.values(diseaseGroups).forEach(cases => {
      totalFirstMonth += cases[0] || 0;
      totalLastMonth += cases[cases.length - 1] || 0;
    });
    
    const trendPercent = totalFirstMonth > 0 
      ? ((totalLastMonth - totalFirstMonth) / totalFirstMonth * 100).toFixed(1)
      : 0;
    const isIncreasing = totalLastMonth > totalFirstMonth;
    const isDecreasing = totalLastMonth < totalFirstMonth;

    // Find peak month
    const monthTotals = {};
    results.forEach(result => {
      if (!monthTotals[result.forecast_month]) {
        monthTotals[result.forecast_month] = 0;
      }
      monthTotals[result.forecast_month] += result.forecast_cases;
    });
    
    const peakMonth = Object.entries(monthTotals).reduce((max, [month, cases]) => 
      cases > max.cases ? { month, cases } : max
    , { month: '', cases: 0 });

    // Find highest risk disease
    const diseaseTotals = {};
    results.forEach(result => {
      if (!diseaseTotals[result.disease_name]) {
        diseaseTotals[result.disease_name] = 0;
      }
      diseaseTotals[result.disease_name] += result.forecast_cases;
    });
    
    const highestRiskDisease = Object.entries(diseaseTotals).reduce((max, [disease, cases]) =>
      cases > max.cases ? { disease, cases } : max
    , { disease: '', cases: 0 });

    // Calculate average accuracy (MAE - Mean Absolute Error in cases)
    const accuracyMetrics = results.filter(r => r.accuracy_mae > 0);
    const avgAccuracy = accuracyMetrics.length > 0
      ? (accuracyMetrics.reduce((sum, r) => sum + r.accuracy_mae, 0) / accuracyMetrics.length).toFixed(1)
      : null;

    return {
      overallTrend: {
        direction: isIncreasing ? 'increasing' : isDecreasing ? 'decreasing' : 'stable',
        percent: Math.abs(trendPercent),
        description: isIncreasing 
          ? `Cases are expected to increase by ${Math.abs(trendPercent)}% over the next ${forecastPeriod} months`
          : isDecreasing
          ? `Cases are expected to decrease by ${Math.abs(trendPercent)}% over the next ${forecastPeriod} months`
          : `Cases are expected to remain stable over the next ${forecastPeriod} months`
      },
      peakPeriod: {
        month: peakMonth.month,
        cases: peakMonth.cases,
        description: `Highest case load expected in ${peakMonth.month} with approximately ${Math.round(peakMonth.cases)} cases`
      },
      highestRisk: {
        disease: highestRiskDisease.disease,
        cases: highestRiskDisease.cases,
        description: `${highestRiskDisease.disease} shows the highest predicted case count with ${Math.round(highestRiskDisease.cases)} total cases`
      },
      recommendation: isIncreasing
        ? `Prioritize preventive measures and resource allocation. Consider increasing medical staff and stockpiling necessary supplies.`
        : isDecreasing
        ? `Continue current prevention strategies. Monitor trends to ensure sustained decline in case numbers.`
        : `Maintain current health protocols and continue regular monitoring of disease patterns.`,
      accuracy: avgAccuracy ? `Average error: ${avgAccuracy} cases (based on historical validation)` : null
    };
  };

  // Generate statistical interpretations for barangay-level forecast data
  const generateBarangayInterpretations = (barangayData) => {
    if (!barangayData || !barangayData.forecast_results) return null;

    const results = barangayData.forecast_results;
    const summary = barangayData.summary;
    const highRiskBarangays = barangayData.high_risk_barangays || {};
    
    // Find most affected barangay
    const barangayTotals = {};
    results.forEach(result => {
      if (!barangayTotals[result.barangay_name]) {
        barangayTotals[result.barangay_name] = 0;
      }
      barangayTotals[result.barangay_name] += result.forecast_cases;
    });
    
    const mostAffected = Object.entries(barangayTotals).reduce((max, [barangay, cases]) =>
      cases > max.cases ? { barangay, cases } : max
    , { barangay: '', cases: 0 });

    // Calculate overall trend across all barangays
    const increasingCount = results.filter(r => r.trend === 'increasing').length;
    const decreasingCount = results.filter(r => r.trend === 'decreasing').length;
    const stableCount = results.filter(r => r.trend === 'stable').length;
    
    const dominantTrend = increasingCount > decreasingCount && increasingCount > stableCount 
      ? 'increasing' 
      : decreasingCount > increasingCount && decreasingCount > stableCount
      ? 'decreasing'
      : 'stable';

    // Find peak month across all barangays
    const monthTotals = {};
    results.forEach(result => {
      if (!monthTotals[result.forecast_month]) {
        monthTotals[result.forecast_month] = 0;
      }
      monthTotals[result.forecast_month] += result.forecast_cases;
    });
    
    const peakMonth = Object.entries(monthTotals).reduce((max, [month, cases]) => 
      cases > max.cases ? { month, cases } : max
    , { month: '', cases: 0 });

    // Find most common disease
    const diseaseCounts = {};
    results.forEach(result => {
      if (!diseaseCounts[result.disease_name]) {
        diseaseCounts[result.disease_name] = 0;
      }
      diseaseCounts[result.disease_name] += result.forecast_cases;
    });
    
    const topDisease = Object.entries(diseaseCounts).reduce((max, [disease, count]) =>
      count > max.count ? { disease, count } : max
    , { disease: '', count: 0 });

    const highRiskCount = Object.keys(highRiskBarangays).length;

    return {
      geographicTrend: {
        mostAffected: mostAffected.barangay,
        cases: mostAffected.cases,
        description: `${mostAffected.barangay} shows the highest predicted case load with ${Math.round(mostAffected.cases)} total cases across all diseases`
      },
      overallTrend: {
        direction: dominantTrend,
        description: dominantTrend === 'increasing'
          ? `${increasingCount} out of ${results.length} forecasts show increasing trends across barangays`
          : dominantTrend === 'decreasing'
          ? `${decreasingCount} out of ${results.length} forecasts show decreasing trends across barangays`
          : `Most barangays show stable disease patterns`
      },
      peakPeriod: {
        month: peakMonth.month,
        cases: peakMonth.cases,
        description: `Peak case load expected in ${peakMonth.month} with approximately ${Math.round(peakMonth.cases)} cases across all barangays`
      },
      topDisease: {
        disease: topDisease.disease,
        count: topDisease.count,
        description: `${topDisease.disease} is the dominant disease with ${Math.round(topDisease.count)} total predicted cases`
      },
      riskAssessment: {
        highRiskCount: highRiskCount,
        description: highRiskCount > 5
          ? `Critical situation: ${highRiskCount} barangays identified as high-risk areas requiring immediate intervention`
          : highRiskCount > 0
          ? `${highRiskCount} barangay${highRiskCount > 1 ? 's' : ''} identified as high-risk, requiring focused attention`
          : `No high-risk barangays identified. Continue monitoring preventive measures.`
      },
      recommendation: dominantTrend === 'increasing'
        ? `Deploy mobile health units to high-risk barangays. Prioritize resource allocation to ${mostAffected.barangay} and surrounding areas.`
        : dominantTrend === 'decreasing'
        ? `Current barangay-level interventions are effective. Continue community health programs and maintain surveillance in all areas.`
        : `Maintain balanced resource distribution across barangays. Monitor for early warning signs in vulnerable communities.`
    };
  };

  const handleGenerateForecast = async () => {
    // Validate forecast period before making API call
    if (forecastPeriod < 1 || forecastPeriod > 12) {
      setError('Forecast period must be between 1 and 12 months. Recommended: 3-6 months for best accuracy.');
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Invalid Forecast Period',
        message: 'Forecast period must be between 1 and 12 months.'
      });
      return;
    }
    
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
      
      // Choose endpoint based on forecast mode
      const endpoint = forecastMode === 'barangay' 
        ? `${import.meta.env.VITE_API_BASE_URL}/arima_forecast_by_barangay.php`
        : `${import.meta.env.VITE_API_BASE_URL}/arima_forecast_disease_summary.php`;
      
      const response = await fetch(endpoint, {
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
      
      console.log('API Response:', data); // DEBUG: Log full response
      
      if (data.success) {
        setLoadingStep('Finalizing results...');
        setProgress(90);
        await new Promise(resolve => setTimeout(resolve, 300));
        setProgress(100);
        
        // Validate data structure before setting state
        if (!data.data) {
          console.error('Missing data object in response:', data);
          throw new Error('Invalid response: missing data object');
        }
        
        // For overall forecast mode, validate summary structure
        if (forecastMode !== 'barangay' && (!data.data.summary || !data.data.forecast_results)) {
          console.error('Missing summary or forecast_results:', data.data);
          throw new Error('Invalid response: missing summary or forecast_results');
        }
        
        // Store data based on forecast mode (keep both datasets for comparison)
        if (forecastMode === 'barangay') {
          setBarangayForecastData(data.data);
          // Don't clear overall forecast - keep it for comparison
        } else {
          setForecastData(data.data);
          // Don't clear barangay forecast - keep it for comparison
        }
        
        // Fetch historical data for comparison chart
        fetchHistoricalData(selectedDisease);
        
        setShowCharts(true);
        
        const forecastType = forecastMode === 'barangay' ? 'Barangay-level' : 'Overall';
        setToast({
          isVisible: true,
          type: 'success',
          title: 'Forecast Generated!',
          message: `${forecastType} ARIMA forecast completed successfully!`
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
        console.error('Forecast failed, backend returned:', data);
        setError(data.error || 'Failed to generate forecast');
        setToast({
          isVisible: true,
          type: 'error',
          title: 'Forecast Failed!',
          message: data.error || 'Failed to generate forecast'
        });
      }
    } catch (err) {
      console.error('Forecast error caught:', err);
      console.error('Error stack:', err.stack);
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

  const fetchHistoricalData = async (disease = null) => {
    try {
      const diseaseParam = disease && disease !== '' ? `&disease=${encodeURIComponent(disease)}` : '';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_historical_disease_data.php?months=12${diseaseParam}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.historical_data) {
          setHistoricalData(data.historical_data);
        }
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Silent fail - historical data is optional
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
    <>
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
              
              {/* NEW: Forecast Mode Toggle */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                  Forecast Mode
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setForecastMode('overall');
                      // Keep both datasets - just switch view
                      // Show charts if overall data exists
                      if (forecastData && forecastData.summary) {
                        setShowCharts(true);
                      }
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      forecastMode === 'overall'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaChartLine className="inline mr-2" />
                    Overall Forecast
                  </button>
                  <button
                    onClick={() => {
                      setForecastMode('barangay');
                      // Keep both datasets - just switch view
                      // Show charts if barangay data exists
                      if (barangayForecastData) {
                        setShowCharts(true);
                      }
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      forecastMode === 'barangay'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaMapMarkerAlt className="inline mr-2" />
                    Barangay-Level Forecast
                  </button>
                </div>
                {forecastMode === 'barangay' && (
                  <p className="mt-3 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                    <FaInfoCircle className="inline mr-2" />
                    Barangay-level forecast shows predicted cases per barangay with high-risk area identification
                  </p>
                )}
              </div>

              {/* Forecast Period Notes - Below Information Box */}
              <div className="mt-3 mb-4 space-y-2">
                {forecastPeriod > 9 && (
                  <p className="text-sm text-amber-600 flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <FaExclamationTriangle className="text-xs flex-shrink-0" />
                    <span>Note: Forecasts beyond 9 months may have reduced accuracy</span>
                  </p>
                )}
                <p className="text-xs text-gray-600 flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <FaInfoCircle className="text-xs flex-shrink-0" />
                  <span>Recommended: 3-6 months for best accuracy</span>
                </p>
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const clamped = Math.max(1, Math.min(12, value)); // Min: 1, Max: 12
                      setForecastPeriod(clamped);
                    }}
                    min="1"
                    max="12"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium"
                    placeholder="Enter months (1-12)..."
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

            {/* Forecast Results Section */}
            {forecastMode === 'overall' && forecastData && forecastData.summary ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Forecast Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Diseases</p>
                        <p className="text-2xl font-bold text-blue-900">
                          <CountUp end={forecastData.summary.total_diseases || 0} duration={2000} />
                        </p>
                      </div>
                      <FaUsers className="text-blue-500 text-3xl" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Forecast Months</p>
                        <p className="text-2xl font-bold text-green-900">
                          <CountUp end={forecastData.summary.total_forecast_months || 0} duration={2000} />
                        </p>
                      </div>
                      <FaCalendarAlt className="text-green-500 text-3xl" />
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Records</p>
                        <p className="text-2xl font-bold text-orange-900">
                          <CountUp end={forecastData.summary.historical_records || 0} duration={2000} />
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

                {/* Statistical Interpretations */}
                {forecastData && (() => {
                  const interpretations = generateInterpretations(forecastData);
                  if (!interpretations) return null;
                  
                  return (
                    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl shadow-lg border border-indigo-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <FaInfoCircle className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indigo-900">Forecast Interpretation</h3>
                          <p className="text-sm text-indigo-600">Data-driven insights from your ARIMA forecast analysis</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Overall Trend */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-indigo-100">
                          <div className="flex items-start gap-3">
                            {interpretations.overallTrend.direction === 'increasing' ? (
                              <FaArrowUp className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                            ) : interpretations.overallTrend.direction === 'decreasing' ? (
                              <FaArrowDown className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
                            ) : (
                              <FaArrowRight className="text-gray-500 text-xl mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Overall Trend</h4>
                              <p className="text-sm text-gray-700">{interpretations.overallTrend.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Peak Period */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-indigo-100">
                          <div className="flex items-start gap-3">
                            <FaCalendarAlt className="text-orange-500 text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Peak Period</h4>
                              <p className="text-sm text-gray-700">{interpretations.peakPeriod.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Highest Risk Disease */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-indigo-100">
                          <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Highest Risk Disease</h4>
                              <p className="text-sm text-gray-700 capitalize">{interpretations.highestRisk.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
                          <div className="flex items-start gap-3">
                            <FaInfoCircle className="text-white text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">💡 Recommendation</h4>
                              <p className="text-sm text-indigo-50">{interpretations.recommendation}</p>
                            </div>
                          </div>
                        </div>

                        {/* Accuracy Badge */}
                        {interpretations.accuracy && (
                          <div className="flex items-center justify-between bg-white/80 backdrop-blur rounded-lg p-3 border border-green-200">
                            <span className="text-sm text-gray-700 font-medium">Forecast Accuracy</span>
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                {interpretations.accuracy}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

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
                          
                          {/* Accuracy Metrics - Show if properties exist */}
                          {((result.accuracy_rmse !== undefined && result.accuracy_rmse !== null) || 
                            (result.accuracy_mae !== undefined && result.accuracy_mae !== null)) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between text-xs">
                                <span className={`${colors.text}`}>
                                  RMSE: {result.accuracy_rmse != null ? result.accuracy_rmse.toFixed(2) : 'N/A'}
                                </span>
                                <span className={`${colors.text}`}>
                                  MAE: {result.accuracy_mae != null ? result.accuracy_mae.toFixed(1) + ' cases' : 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clean Bar Chart Visualization */}
                {forecastData && forecastData.forecast_results && (
                  <SimpleForecastChart forecastResults={forecastData.forecast_results} />
                )}

                {/* Actual vs Forecast Comparison Chart */}
                {forecastData && forecastData.forecast_results && (
                  <ActualVsForecastChart 
                    forecastResults={forecastData.forecast_results} 
                    historicalData={historicalData}
                  />
                )}
              </div>
            ) : forecastMode === 'barangay' && barangayForecastData ? (
              <div className="space-y-6">
                {/* Barangay Forecast Summary Cards */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Barangay Forecast Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Total Forecasts</p>
                        <p className="text-2xl font-bold text-blue-900">
                          <CountUp end={barangayForecastData.summary?.total_forecasts || 0} duration={2000} />
                        </p>
                      </div>
                      <FaChartLine className="text-blue-500 text-3xl" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Barangays</p>
                        <p className="text-2xl font-bold text-green-900">
                          <CountUp end={barangayForecastData.summary?.unique_barangays || 0} duration={2000} />
                        </p>
                      </div>
                      <FaMapMarkerAlt className="text-green-500 text-3xl" />
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Diseases Tracked</p>
                        <p className="text-2xl font-bold text-orange-900">
                          <CountUp end={barangayForecastData.summary?.unique_diseases || 0} duration={2000} />
                        </p>
                      </div>
                      <FaUsers className="text-orange-500 text-3xl" />
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-sm text-red-700 font-medium">High-Risk Barangays</p>
                        <p className="text-2xl font-bold text-red-900">
                          <CountUp end={barangayForecastData.summary?.barangays_at_risk || 0} duration={2000} />
                        </p>
                      </div>
                      <FaExclamationTriangle className="text-red-500 text-3xl" />
                    </div>
                  </div>
                </div>

                {/* Barangay Statistical Interpretations */}
                {barangayForecastData && (() => {
                  const interpretations = generateBarangayInterpretations(barangayForecastData);
                  if (!interpretations) return null;
                  
                  return (
                    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-xl shadow-lg border border-purple-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <FaMapMarkerAlt className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-purple-900">Barangay-Level Insights</h3>
                          <p className="text-sm text-purple-600">Geographic analysis of disease patterns by barangay</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Most Affected Barangay */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Most Affected Area</h4>
                              <p className="text-sm text-gray-700">{interpretations.geographicTrend.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Overall Geographic Trend */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            {interpretations.overallTrend.direction === 'increasing' ? (
                              <FaArrowUp className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                            ) : interpretations.overallTrend.direction === 'decreasing' ? (
                              <FaArrowDown className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
                            ) : (
                              <FaArrowRight className="text-gray-500 text-xl mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Geographic Trend</h4>
                              <p className="text-sm text-gray-700">{interpretations.overallTrend.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Peak Period */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <FaCalendarAlt className="text-orange-500 text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Peak Period</h4>
                              <p className="text-sm text-gray-700">{interpretations.peakPeriod.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Dominant Disease */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-orange-500 text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Dominant Disease</h4>
                              <p className="text-sm text-gray-700 capitalize">{interpretations.topDisease.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-purple-100">
                          <div className="flex items-start gap-3">
                            <FaExclamationTriangle className={`text-xl mt-0.5 flex-shrink-0 ${
                              interpretations.riskAssessment.highRiskCount > 5 ? 'text-red-500' : 
                              interpretations.riskAssessment.highRiskCount > 0 ? 'text-orange-500' : 
                              'text-green-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Risk Assessment</h4>
                              <p className="text-sm text-gray-700">{interpretations.riskAssessment.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
                          <div className="flex items-start gap-3">
                            <FaInfoCircle className="text-white text-xl mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">💡 Geographic Recommendation</h4>
                              <p className="text-sm text-purple-50">{interpretations.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Barangay Forecast Visualization Bar Chart */}
                {barangayForecastData && barangayForecastData.forecast_results && (
                  <BarangayForecastChart forecastResults={barangayForecastData.forecast_results} />
                )}

                {/* High Risk Barangays Alert Section */}
                {barangayForecastData.high_risk_barangays && Object.keys(barangayForecastData.high_risk_barangays).length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
                    <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <FaExclamationTriangle className="text-red-600" />
                      High-Risk Barangays (Increasing Cases)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These barangays show an increasing trend in disease cases and require immediate attention.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(barangayForecastData.high_risk_barangays).map(([barangay, data]) => (
                        <div key={barangay} className="bg-red-50 border border-red-200 p-4 rounded-xl hover:shadow-lg transition-all">
                          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-600" />
                            {barangay}
                          </h4>
                          <div className="space-y-2">
                            {data.diseases?.map((d, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-lg border border-red-100">
                                <p className="text-sm font-semibold text-red-800">{d.disease}</p>
                                <div className="flex justify-between text-xs text-red-600 mt-1">
                                  <span>Predicted: {d.forecast_cases} cases</span>
                                  <span>{d.month}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Last: {d.last_actual} cases</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-xs text-red-700 font-medium">
                              Total Predicted: {data.total_predicted_cases} cases
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Barangay Forecast Results */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-700 mb-6">Detailed Forecast by Barangay</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {barangayForecastData.forecast_results?.map((result, index) => {
                      const colors = getDiseaseColor(result.disease_name);
                      
                      // Modern trend indicator with icons
                      const getTrendIndicator = (trend) => {
                        if (trend === 'increasing') {
                          return {
                            icon: <FaArrowUp className="w-4 h-4" />,
                            color: 'bg-red-100 text-red-700 border-red-200',
                            label: 'Increasing'
                          };
                        } else if (trend === 'decreasing') {
                          return {
                            icon: <FaArrowDown className="w-4 h-4" />,
                            color: 'bg-green-100 text-green-700 border-green-200',
                            label: 'Decreasing'
                          };
                        } else {
                          return {
                            icon: <FaArrowRight className="w-4 h-4" />,
                            color: 'bg-gray-100 text-gray-700 border-gray-200',
                            label: 'Stable'
                          };
                        }
                      };
                      
                      const trendIndicator = getTrendIndicator(result.trend);
                      
                      return (
                        <div key={index} className={`${colors.bg} p-4 rounded-xl shadow-sm hover:shadow-lg transition-all border ${colors.border}`}>
                          <div className="flex items-start justify-between mb-2">
                            <p className={`text-sm ${colors.text} capitalize font-medium`}>{result.disease_name}</p>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${trendIndicator.color} font-medium text-xs`}>
                              {trendIndicator.icon}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <FaMapMarkerAlt className={colors.text} />
                            {result.barangay_name}
                          </p>
                          <p className={`text-lg font-semibold ${colors.textDark} mt-1`}>{result.forecast_month}</p>
                          <p className={`text-2xl font-bold ${colors.textDark} mt-2`}>
                            {result.forecast_cases} 
                            <span className={`text-sm font-normal ${colors.text} ml-1`}>cases</span>
                          </p>
                          <div className="mt-2 text-xs text-gray-600">
                            <p>Last: {result.last_actual_cases} cases</p>
                            <div className={`mt-1 flex items-center gap-1 ${trendIndicator.color.split(' ')[1]} font-medium`}>
                              {trendIndicator.icon}
                              <span className="capitalize">{trendIndicator.label}</span>
                            </div>
                          </div>
                          
                          {/* Accuracy Metrics - Show if properties exist */}
                          {((result.accuracy_rmse !== undefined && result.accuracy_rmse !== null) || 
                            (result.accuracy_mae !== undefined && result.accuracy_mae !== null)) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between text-xs">
                                <span className={`${colors.text}`}>
                                  RMSE: {result.accuracy_rmse != null ? result.accuracy_rmse.toFixed(2) : 'N/A'}
                                </span>
                                <span className={`${colors.text}`}>
                                  MAE: {result.accuracy_mae != null ? result.accuracy_mae.toFixed(1) + ' cases' : 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
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

      {/* Enhanced Loading Overlay - Positioned outside motion.div for full screen coverage */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
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
    </>
  );
};

export default ARIMAForecast;
