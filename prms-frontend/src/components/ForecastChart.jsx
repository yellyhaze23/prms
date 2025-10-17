import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
import { FaChartLine, FaFilter, FaDownload } from 'react-icons/fa';

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

const ForecastChart = ({ forecastData, historicalData, diseaseName, forecastPeriod }) => {
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Get unique diseases from forecast data
  const availableDiseases = forecastData ? 
    [...new Set(forecastData.map(result => result.disease_name))] : [];

  // Initialize selected diseases
  useEffect(() => {
    if (availableDiseases.length > 0 && selectedDiseases.length === 0) {
      setSelectedDiseases(availableDiseases);
    }
  }, [availableDiseases, selectedDiseases.length]);

  // Process data for chart
  useEffect(() => {
    if (!forecastData || forecastData.length === 0) return;

    // Group forecast data by disease
    const diseaseGroups = {};
    forecastData.forEach(result => {
      if (!diseaseGroups[result.disease_name]) {
        diseaseGroups[result.disease_name] = {
          historical: [],
          forecast: []
        };
      }
      diseaseGroups[result.disease_name].forecast.push({
        month: result.forecast_month,
        cases: result.forecast_cases,
        confidence_lower: result.confidence_lower || result.forecast_cases * 0.8,
        confidence_upper: result.confidence_upper || result.forecast_cases * 1.2,
        type: 'forecast'
      });
    });

    // Add historical data if available
    if (historicalData) {
      Object.keys(historicalData).forEach(disease => {
        if (diseaseGroups[disease]) {
          diseaseGroups[disease].historical = historicalData[disease].map(data => ({
            month: data.month,
            cases: data.cases,
            type: 'historical'
          }));
        }
      });
    }

    // Create chart data
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16'  // Lime
    ];

    // Create connected datasets with smooth transitions
    const datasets = [];
    
    selectedDiseases.forEach((disease, index) => {
      const diseaseData = diseaseGroups[disease];
      if (!diseaseData) return;

      const color = colors[index % colors.length];
      const historicalData = (diseaseData.historical || []).sort((a, b) => new Date(a.month) - new Date(b.month));
      const forecastData = (diseaseData.forecast || []).sort((a, b) => new Date(a.month) - new Date(b.month));

      // Create continuous line by combining historical and forecast data
      if (historicalData.length > 0 && forecastData.length > 0) {
        // Combine all data into one continuous line
        const allData = [...historicalData, ...forecastData].sort((a, b) => new Date(a.month) - new Date(b.month));
        
        // Find the transition point (where forecast starts)
        const forecastStartMonth = forecastData[0].month;
        
        datasets.push({
          label: disease,
          data: allData.map(d => ({
            x: d.month,
            y: d.cases,
            isForecast: d.month >= forecastStartMonth
          })),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderDash: [], // Solid line for entire dataset
          order: 2
        });
      } else if (historicalData.length > 0) {
        // Only historical data
        datasets.push({
          label: disease,
          data: historicalData.map(d => ({
            x: d.month,
            y: d.cases
          })),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderDash: [], // Solid line
          order: 2
        });
      } else if (forecastData.length > 0) {
        // Only forecast data
        datasets.push({
          label: disease,
          data: forecastData.map(d => ({
            x: d.month,
            y: d.cases,
            confidence_lower: d.confidence_lower,
            confidence_upper: d.confidence_upper,
            isForecast: true
          })),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderDash: [], // Solid line for forecast too
          order: 1
        });
      }
    });


    // Add division line to mark forecast start
    const forecastStartMonth = forecastData?.forecast_results?.[0]?.month;
    const divisionLineDataset = {
      label: 'Forecast Division',
      data: forecastStartMonth ? [
        { x: forecastStartMonth, y: 0 },
        { x: forecastStartMonth, y: 20 }
      ] : [],
      borderColor: '#dc2626',
      backgroundColor: 'transparent',
      borderWidth: 3,
      borderDash: [8, 4],
      pointRadius: 0,
      pointHoverRadius: 0,
      showLine: true,
      fill: false,
      tension: 0,
      order: 0 // Behind everything
    };

    setChartData({
      datasets: [...datasets, divisionLineDataset]
    });
  }, [forecastData, selectedDiseases]);

  const handleDiseaseToggle = (disease) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) 
        ? prev.filter(d => d !== disease)
        : [...prev, disease]
    );
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          filter: (legendItem) => {
            // Hide division line from legend
            return !legendItem.text.includes('Forecast Division');
          }
        }
      },
      title: {
        display: true,
        text: `Disease Forecast: ${diseaseName || 'All Diseases'} (${forecastPeriod} months)`,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return `Month: ${context[0].label}`;
          },
          label: (context) => {
            if (context.dataset.label.includes('Confidence Interval')) {
              return null; // Hide confidence interval from tooltip
            }
            return `${context.dataset.label}: ${context.parsed.y} predicted cases`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Forecast Month',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Predicted Cases',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverBackgroundColor: '#fff'
      }
    }
  };

  if (!chartData || chartData.datasets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <FaChartLine className="text-4xl mx-auto mb-4 text-gray-300" />
          <p>No forecast data available for chart visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaChartLine className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Forecast Visualization</h3>
            <p className="text-sm text-gray-500">Historical trends and future predictions</p>
          </div>
        </div>
        
      </div>

      {/* Disease Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <FaFilter className="text-gray-400 w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">Filter Diseases:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableDiseases.map((disease) => (
            <button
              key={disease}
              onClick={() => handleDiseaseToggle(disease)}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-150 ${
                selectedDiseases.includes(disease)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {disease}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <Line
          data={chartData}
          options={chartOptions}
        />
      </div>

      {/* Chart Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>• Historical data and forecast predictions</span>
            <span>• Red line marks forecast start</span>
          </div>
          <div className="text-xs text-gray-500">
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;