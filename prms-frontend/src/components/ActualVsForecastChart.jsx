import React, { useMemo } from 'react';
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

const ActualVsForecastChart = ({ forecastResults, historicalData }) => {
  // Process data for chart - combine historical and forecast into ONE continuous line per disease
  const chartData = useMemo(() => {
    if (!forecastResults || forecastResults.length === 0) return null;

    // Filter out error entries
    const validForecasts = forecastResults.filter(result => 
      result.forecast_month !== "Error" && 
      result.forecast_month !== "error" &&
      !result.error &&
      result.forecast_month &&
      result.disease_name
    );

    if (validForecasts.length === 0) return null;

    // Group by disease
    const diseaseGroups = {};
    validForecasts.forEach(result => {
      if (!diseaseGroups[result.disease_name]) {
        diseaseGroups[result.disease_name] = {
          historical: [],
          forecast: []
        };
      }
      diseaseGroups[result.disease_name].forecast.push({
        month: result.forecast_month,
        cases: result.forecast_cases
      });
    });

    // Add historical data if available
    if (historicalData && Object.keys(historicalData).length > 0) {
      Object.keys(historicalData).forEach(diseaseName => {
        // Check if disease exists in forecast results (case-insensitive match)
        const matchingDisease = Object.keys(diseaseGroups).find(d => 
          d.toLowerCase() === diseaseName.toLowerCase()
        );
        
        if (matchingDisease && diseaseGroups[matchingDisease]) {
          const historical = historicalData[diseaseName];
          if (Array.isArray(historical)) {
            diseaseGroups[matchingDisease].historical = historical.map(item => ({
              month: item.month || (item.year && item.month ? `${item.year}-${String(item.month).padStart(2, '0')}` : null),
              cases: item.cases || item.total_cases || 0
            })).filter(item => item.month).sort((a, b) => a.month.localeCompare(b.month));
          }
        }
      });
    }

    // Define colors for each disease
    const diseaseColors = {
      'Chickenpox': '#3B82F6',
      'Dengue': '#EF4444',
      'Hepatitis': '#10B981',
      'Measles': '#F59E0B',
      'Tuberculosis': '#8B5CF6'
    };

    // Create datasets - ONE continuous line per disease using segment styling
    const datasets = [];
    let forecastStartMonth = null;

    Object.keys(diseaseGroups).forEach(diseaseName => {
      const group = diseaseGroups[diseaseName];
      const color = diseaseColors[diseaseName] || '#6B7280';

      // Sort both historical and forecast data
      const historical = group.historical.sort((a, b) => a.month.localeCompare(b.month));
      const forecast = group.forecast.sort((a, b) => a.month.localeCompare(b.month));

      if (historical.length === 0 && forecast.length === 0) return;

      // Determine forecast start month (first forecast month)
      const firstForecastMonth = forecast.length > 0 ? forecast[0].month : null;
      if (firstForecastMonth && !forecastStartMonth) {
        forecastStartMonth = firstForecastMonth;
      }

      // Combine historical and forecast into ONE continuous dataset
      // Remove duplicates by month (prefer historical if both exist)
      const dataMap = new Map();
      historical.forEach(item => {
        dataMap.set(item.month, { ...item, isForecast: false });
      });
      forecast.forEach(item => {
        // Only add if not already in map (to prefer historical)
        if (!dataMap.has(item.month)) {
          dataMap.set(item.month, { ...item, isForecast: true });
        }
      });

      const allData = Array.from(dataMap.values()).sort((a, b) => a.month.localeCompare(b.month));

      // Add bridge point if there's a gap between last historical and first forecast
      if (historical.length > 0 && forecast.length > 0) {
        const lastHistoricalMonth = historical[historical.length - 1].month;
        const firstForecastMonth = forecast[0].month;
        
        // If months don't connect, add a bridge point
        if (lastHistoricalMonth !== firstForecastMonth) {
          // Find index of first forecast month
          const firstForecastIndex = allData.findIndex(d => d.month === firstForecastMonth);
          const lastHistoricalValue = historical[historical.length - 1].cases;
          
          // Insert bridge point right before first forecast
          if (firstForecastIndex >= 0) {
            allData.splice(firstForecastIndex, 0, {
              month: lastHistoricalMonth,
              cases: lastHistoricalValue,
              isForecast: false
            });
          }
        }
      }

      // Mark all data points after forecast start as forecast
      const processedData = allData.map((d, index) => {
        const isForecast = firstForecastMonth ? d.month >= firstForecastMonth : false;
        return {
          x: d.month,
          y: d.cases,
          isForecast: isForecast || d.isForecast || false
        };
      });

      // Create single dataset with segment styling
      datasets.push({
        label: diseaseName,
        data: processedData,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        // KEY: Use segment to change from solid to dashed at forecast start
        segment: {
          borderDash: (ctx) => {
            // Check if this segment is in forecast range
            const p0 = ctx.p0;
            const p1 = ctx.p1;
            const isP0Forecast = p0.raw?.isForecast || false;
            const isP1Forecast = p1.raw?.isForecast || false;
            
            // If both points are forecast, use dashed
            if (isP0Forecast && isP1Forecast) {
              return [8, 4];
            }
            // If transitioning from actual to forecast, make it dashed from transition point
            if (!isP0Forecast && isP1Forecast) {
              return [8, 4];
            }
            // Otherwise solid (both actual)
            return [];
          }
        },
        order: 2
      });
    });

    // Add vertical division line at forecast start
    if (forecastStartMonth) {
      const maxY = Math.max(
        ...datasets.flatMap(ds => ds.data.map(d => d.y || 0)),
        10
      );

      datasets.push({
        label: 'Forecast Start',
        data: [
          { x: forecastStartMonth, y: 0 },
          { x: forecastStartMonth, y: maxY }
        ],
        borderColor: '#DC2626',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0,
        order: 0
      });
    }

    return {
      datasets: datasets
    };
  }, [forecastResults, historicalData]);

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          },
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            // Filter out the division line from legend
            return original.filter(label => label.text !== 'Forecast Start');
          }
        }
      },
      title: {
        display: true,
        text: 'Actual vs Forecast Comparison',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#374151',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = Math.round(context.parsed.y);
            const isForecast = context.raw?.isForecast || false;
            const dataType = isForecast ? 'Forecast' : 'Actual';
            return `${label} (${dataType}): ${value} cases`;
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
          text: 'Month',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151'
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Cases',
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151'
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          precision: 0,
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  }), []);

  if (!chartData || chartData.datasets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
      {/* Chart Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <FaChartLine className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Actual vs Forecast Comparison</h3>
          <p className="text-sm text-gray-500">Historical data (solid) vs predicted forecasts (dashed)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Chart Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-3 h-0.5 bg-blue-600 mr-2"></span>
              Actual Data (Solid Line)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-0.5 border-dashed border-2 border-blue-600 mr-2"></span>
              Forecast (Dashed Line)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-0.5 bg-red-600 mr-2 border-dashed"></span>
              Forecast Start Marker
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Lines transition smoothly from solid (actual) to dashed (forecast) at the red marker
        </p>
      </div>
    </div>
  );
};

export default ActualVsForecastChart;
