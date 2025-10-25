import React, { useState, useEffect, useMemo } from 'react';
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
import { FaChartLine } from 'react-icons/fa';

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

// Helper function to properly sort dates
const sortByDate = (a, b) => {
  const dateA = new Date(a.month);
  const dateB = new Date(b.month);
  return dateA - dateB;
};

const ForecastChart = ({ forecastData, historicalData, diseaseName, forecastPeriod, predictions, disease }) => {
  const [selectedDiseases, setSelectedDiseases] = useState([]);

  // Handle simple predictions array format (from staff forecast page)
  const isSimpleFormat = predictions && Array.isArray(predictions);

  // Get unique diseases from forecast data - Memoized
  const availableDiseases = useMemo(() => {
    if (!forecastData) return [];
    return [...new Set(forecastData.map(result => result.disease_name))];
  }, [forecastData]);

  // Initialize selected diseases
  useEffect(() => {
    if (availableDiseases.length > 0 && selectedDiseases.length === 0) {
      setSelectedDiseases(availableDiseases);
    }
  }, [availableDiseases]);

  // Process disease groups - Memoized for performance
  const diseaseGroups = useMemo(() => {
    if (!forecastData || forecastData.length === 0) return {};

    const groups = {};
    forecastData.forEach(result => {
      if (!groups[result.disease_name]) {
        groups[result.disease_name] = {
          historical: [],
          forecast: []
        };
      }
      groups[result.disease_name].forecast.push({
        month: result.forecast_month,
        cases: result.forecast_cases,
        confidence_lower: result.confidence_lower || result.forecast_cases * 0.8,
        confidence_upper: result.confidence_upper || result.forecast_cases * 1.2,
        type: 'forecast'
      });
    });

    // Add historical data if available
    if (historicalData) {
      Object.keys(historicalData).forEach(diseaseName => {
        if (groups[diseaseName]) {
          groups[diseaseName].historical = historicalData[diseaseName].map(data => ({
            month: data.month,
            cases: data.cases,
            type: 'historical'
          }));
        }
      });
    }

    return groups;
  }, [forecastData, historicalData]);

  // Chart data for simple format - Memoized
  const simpleChartData = useMemo(() => {
    if (!isSimpleFormat || !predictions || predictions.length === 0) return null;

    const color = '#3B82F6';
    const sortedPredictions = [...predictions].sort(sortByDate);
    
    return {
      datasets: [{
        label: disease || diseaseName || 'Forecast',
        data: sortedPredictions.map(p => ({
          x: p.month,
          y: p.cases
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
        order: 1
      }]
    };
  }, [isSimpleFormat, predictions, disease, diseaseName]);

  // Chart data for complex format - Memoized
  const complexChartData = useMemo(() => {
    if (isSimpleFormat || Object.keys(diseaseGroups).length === 0) return null;

    const colors = [
      '#3B82F6', // Blue (Chickenpox)
      '#EF4444', // Red (Dengue)
      '#10B981', // Green (Hepatitis)
      '#F59E0B', // Yellow (Measles)
      '#8B5CF6', // Purple (Tuberculosis)
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16'  // Lime
    ];

    const datasets = [];
    let forecastStartMonth = null;
    
    selectedDiseases.forEach((diseaseName, index) => {
      const diseaseData = diseaseGroups[diseaseName];
      if (!diseaseData) return;

      const color = colors[index % colors.length];
      
      // Sort data properly by date
      const historicalData = (diseaseData.historical || []).sort(sortByDate);
      const forecastDataPoints = (diseaseData.forecast || []).sort(sortByDate);

      // Store first forecast month for division line
      if (!forecastStartMonth && forecastDataPoints.length > 0) {
        forecastStartMonth = forecastDataPoints[0].month;
      }

      // Create continuous line by combining historical and forecast data
      if (historicalData.length > 0 && forecastDataPoints.length > 0) {
        const allData = [...historicalData, ...forecastDataPoints].sort(sortByDate);
        const forecastStart = forecastDataPoints[0].month;
        
        datasets.push({
          label: diseaseName,
          data: allData.map(d => ({
            x: d.month,
            y: d.cases,
            isForecast: new Date(d.month) >= new Date(forecastStart)
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
          segment: {
            borderDash: ctx => {
              const point = allData[ctx.p0DataIndex];
              return new Date(point.month) >= new Date(forecastStart) ? [5, 5] : [];
            }
          },
          order: 2
        });
      } else if (historicalData.length > 0) {
        // Only historical data
        datasets.push({
          label: diseaseName,
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
          order: 2
        });
      } else if (forecastDataPoints.length > 0) {
        // Only forecast data
        if (!forecastStartMonth) {
          forecastStartMonth = forecastDataPoints[0].month;
        }
        
        datasets.push({
          label: diseaseName,
          data: forecastDataPoints.map(d => ({
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
          borderDash: [5, 5],
          order: 1
        });
      }
    });

    // Add division line to mark forecast start - FIXED
    if (forecastStartMonth) {
      // Get max Y value from all datasets for proper line height
      const maxY = Math.max(
        ...datasets.flatMap(ds => ds.data.map(d => d.y || 0)),
        20
      );
      
      datasets.push({
        label: 'Forecast Division',
        data: [
          { x: forecastStartMonth, y: 0 },
          { x: forecastStartMonth, y: maxY }
        ],
        borderColor: '#dc2626',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        showLine: true,
        fill: false,
        tension: 0,
        order: 0
      });
    }

    return { datasets };
  }, [diseaseGroups, selectedDiseases, isSimpleFormat]);

  // Final chart data
  const chartData = isSimpleFormat ? simpleChartData : complexChartData;

  // Chart options - Memoized
  const chartOptions = useMemo(() => ({
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
            if (context.dataset.label.includes('Forecast Division')) {
              return null;
            }
            const label = context.dataset.label || '';
            const value = Math.round(context.parsed.y);
            return `${label}: ${value} predicted cases`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
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
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 45
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
        },
        ticks: {
          precision: 0
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
  }), [diseaseName, forecastPeriod]);

  if (!chartData || chartData.datasets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Chart Data Available
        </h3>
        <p className="text-gray-600">
          Generate a forecast to view the visualization
        </p>
      </div>
    );
  }

  return (
    <div className={isSimpleFormat ? "" : "bg-white rounded-xl shadow-lg border border-gray-200 p-6"}>
      {/* Chart Header (only for complex format) */}
      {!isSimpleFormat && (
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
      )}

      {/* Disease Filter removed - showing all diseases by default for cleaner interface */}

      {/* Chart */}
      <div className={isSimpleFormat ? "h-80" : "h-96"}>
        <Line
          data={chartData}
          options={chartOptions}
        />
      </div>

      {/* Chart Info (only for complex format) */}
      {!isSimpleFormat && (
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
      )}
    </div>
  );
};

export default ForecastChart;