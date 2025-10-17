import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  FaUsers,
  FaVirus,
  FaUserCheck,
  FaUserInjured,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaEye,
  FaFileExport
} from 'react-icons/fa';
import './Reports.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Reports() {
  const [reportData, setReportData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState('All');
  const [dateRange, setDateRange] = useState('30');
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, trends, forecast
  const [showFilters, setShowFilters] = useState(false);
  const [diseases, setDiseases] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchDiseases();
    fetchForecastData();
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    fetchData();
  }, [selectedDisease, dateRange, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedDisease !== 'All') {
        params.append('disease', selectedDisease);
      }
      params.append('days', dateRange);
      params.append('view_mode', viewMode);

      const response = await fetch(`http://localhost/prms/prms-backend/get_reports_data.php?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
      } else {
        throw new Error(data.error || 'Failed to load report data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      const response = await fetch('http://localhost/prms/prms-backend/get_diseases.php');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDiseases(data.diseases || []);
        }
      }
    } catch (err) {
      console.error('Error fetching diseases:', err);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await fetch('http://localhost/prms/prms-backend/get_recent_forecasts.php');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setForecastData(data.forecasts || []);
        }
      }
    } catch (err) {
      console.error('Error fetching forecast data:', err);
    }
  };

  // Get data from reportData or use defaults
  const patients = reportData?.patients || [];
  const summary = reportData?.summary || { total_patients: 0, infected_patients: 0, healthy_patients: 0, infection_rate: 0 };
  const diseaseStats = reportData?.disease_stats || [];
  const locationStats = reportData?.location_stats || [];
  const trendData = reportData?.trend_data || [];
  const ageGroups = reportData?.age_distribution || { '0-17': 0, '18-30': 0, '31-50': 0, '51-70': 0, '70+': 0 };
  const genderStats = reportData?.gender_distribution || { Male: 0, Female: 0 };

  // Filter data based on selected disease and date range
  const getFilteredData = () => {
    let filtered = patients;
    
    // Filter by disease
    if (selectedDisease !== 'All') {
      filtered = filtered.filter(patient => 
        patient.disease === selectedDisease
      );
    }
    
    // Filter by date range
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    filtered = filtered.filter(patient => {
      const patientDate = new Date(patient.last_visit || patient.created_at);
      return patientDate >= cutoffDate;
    });
    
    return filtered;
  };

  const filteredPatients = getFilteredData();

  // Calculate statistics from filtered data
  const totalPatients = filteredPatients.length;
  const infectedPatients = filteredPatients.filter(p => p.disease && p.disease.trim()).length;
  const healthyPatients = totalPatients - infectedPatients;
  const infectionRate = totalPatients ? ((infectedPatients / totalPatients) * 100).toFixed(1) : 0;

  // Process disease data for charts
  const diseaseLabels = diseaseStats.map(d => d.disease);
  const diseaseCounts = diseaseStats.map(d => d.total_cases);

  // Process trend data for charts
  const processedTrendData = trendData.slice(-7).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: d.total_patients,
    infected: d.infected_patients
  }));

  // Get top locations
  const topLocations = locationStats.slice(0, 10).map(loc => [loc.barangay, loc.total_cases]);

  // Chart configurations
  const diseaseChartData = {
    labels: diseaseLabels,
    datasets: [{
      label: 'Cases',
      data: diseaseCounts,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#8BC34A',
        '#FF9800',
        '#9C27B0',
        '#4BC0C0',
        '#E91E63',
        '#795548',
        '#607D8B'
      ],
      borderColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#8BC34A',
        '#FF9800',
        '#9C27B0',
        '#4BC0C0',
        '#E91E63',
        '#795548',
        '#607D8B'
      ],
      borderWidth: 1
    }]
  };

  const ageChartData = {
    labels: Object.keys(ageGroups),
    datasets: [{
      label: 'Patients',
      data: Object.values(ageGroups),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#8BC34A',
        '#FF9800'
      ],
      borderColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#8BC34A',
        '#FF9800'
      ],
      borderWidth: 1
    }]
  };

  const genderChartData = {
    labels: Object.keys(genderStats),
    datasets: [{
      data: Object.values(genderStats),
      backgroundColor: ['#36A2EB', '#FF6384'],
      borderColor: ['#36A2EB', '#FF6384'],
      borderWidth: 1
    }]
  };

  const trendChartData = {
    labels: processedTrendData.map(d => d.date),
    datasets: [
      {
        label: 'Total Patients',
        data: processedTrendData.map(d => d.count),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Infected Patients',
        data: processedTrendData.map(d => d.infected),
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Disease Distribution'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patient Trends (Last 7 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  // Export functions
  const exportToCSV = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for RHU export
      const params = new URLSearchParams();
      if (selectedDisease !== 'All') {
        params.append('disease', selectedDisease);
      }
      params.append('days', dateRange);
      
      const response = await fetch(`http://localhost/prms/prms-backend/get_rhu_export_data.php?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch export data');
      
      const data = await response.json();
      
      if (data.success) {
        // Generate RHU-IS format CSV
        let csvContent = 'Barangay,Disease,ICD Code,Age,Gender,Month-Year,Case Count\n';
        
        data.data.forEach(record => {
          csvContent += `"${record.barangay}","${record.disease}","${record.icd_code || 'N/A'}","${record.age}","${record.gender}","${record.month_year}","${record.case_count}"\n`;
        });
        
        const filename = `RHU_IS_Export_${selectedDisease === 'All' ? 'All_Diseases' : selectedDisease}_${dateRange}days_${new Date().toISOString().split('T')[0]}.csv`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        alert(`Export successful! ${data.total_records} records exported.`);
      } else {
        throw new Error(data.error || 'Failed to export data');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Modern Header with Controls */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Disease Reports & Analytics</h1>
              <p className="text-gray-700 mt-2">Comprehensive health data analysis and insights</p>
            </div>
            
            {/* Controls on the right */}
            <div className="flex items-center space-x-4">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FaFilter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaDownload className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disease</label>
                <select
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Diseases</option>
                  {diseaseStats.map(disease => (
                    <option key={disease.disease} value={disease.disease}>{disease.disease}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overview">Overview</option>
                  <option value="detailed">Detailed</option>
                  <option value="trends">Trends</option>
                  <option value="forecast">ARIMA Forecasts</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Diseases Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaVirus className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Diseases</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.total_diseases || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Cases Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaUserInjured className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.total_cases || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* High Risk Areas Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaExclamationTriangle className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">High Risk Areas</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.high_risk_areas || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Average Cases Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                  <FaChartBar className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Cases/Day</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.avg_cases_per_day || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Disease Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartBar className="mr-2 text-blue-600" />
                Disease Distribution
              </h3>
            </div>
            <div className="h-80">
              <Bar data={diseaseChartData} options={chartOptions} />
            </div>
          </div>

          {/* Gender Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartPie className="mr-2 text-green-600" />
                Gender Distribution
              </h3>
            </div>
            <div className="h-80">
              <Doughnut data={genderChartData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Age Distribution and Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Age Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartBar className="mr-2 text-purple-600" />
                Age Distribution
              </h3>
            </div>
            <div className="h-80">
              <Bar data={ageChartData} options={chartOptions} />
            </div>
          </div>

          {/* Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-orange-600" />
                Patient Trends
              </h3>
            </div>
            <div className="h-80">
              <Line data={trendChartData} options={trendOptions} />
            </div>
          </div>
        </div>

        {/* Top Locations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-red-600" />
              Top Affected Locations
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topLocations.map(([location, count], index) => (
                  <tr key={location} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((count / summary.total_patients) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ARIMA Forecast View */}
        {viewMode === 'forecast' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                ARIMA Disease Forecasts
              </h3>
              
              {forecastData && forecastData.length > 0 ? (
                <div className="space-y-4">
                  {forecastData.map((forecast, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold text-gray-800">{forecast.disease}</h4>
                        <span className="text-sm text-gray-500">
                          Generated: {new Date(forecast.generated_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {forecast.forecast_results && forecast.forecast_results.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disease</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Predicted Cases</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {forecast.forecast_results.map((data, dataIndex) => (
                                <tr key={dataIndex} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900 font-medium">{data.disease_name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{data.forecast_month}</td>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{data.forecast_cases}</td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      data.forecast_cases > 10 ? 'bg-red-100 text-red-800' :
                                      data.forecast_cases > 5 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {data.forecast_cases > 10 ? 'High Risk' :
                                       data.forecast_cases > 5 ? 'Medium Risk' : 'Low Risk'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No forecast data available</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecasts Available</h3>
                  <p className="text-gray-500">Generate ARIMA forecasts from the Forecasting page to view them here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;