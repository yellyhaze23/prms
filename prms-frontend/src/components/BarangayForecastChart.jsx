import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaChartBar } from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarangayForecastChart = ({ forecastResults }) => {
  // Process data for chart - Group by Barangay
  const chartData = useMemo(() => {
    if (!forecastResults || forecastResults.length === 0) return null;

    // Filter out error entries
    const validResults = forecastResults.filter(result => 
      result.forecast_month !== "Error" && 
      result.forecast_month !== "error" &&
      !result.error &&
      result.barangay_name &&
      result.disease_name
    );

    if (validResults.length === 0) return null;

    // Group by barangay and aggregate total cases across all diseases and months
    const barangayGroups = {};
    validResults.forEach(result => {
      if (!barangayGroups[result.barangay_name]) {
        barangayGroups[result.barangay_name] = 0;
      }
      barangayGroups[result.barangay_name] += result.forecast_cases || 0;
    });

    // Sort barangays by total cases (descending) for better visualization
    const sortedBarangays = Object.entries(barangayGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Limit to top 15 barangays to avoid overcrowding

    // Get unique diseases for grouping (optional - if we want to show by disease too)
    const allDiseases = [...new Set(validResults.map(r => r.disease_name))].sort();

    // Define colors for each disease
    const diseaseColors = {
      'Chickenpox': '#3B82F6',   // Blue
      'Dengue': '#EF4444',       // Red
      'Hepatitis': '#10B981',    // Green
      'Measles': '#F59E0B',      // Yellow/Orange
      'Tuberculosis': '#8B5CF6'  // Purple
    };

    // Create datasets grouped by disease for each barangay
    const datasets = allDiseases.map(diseaseName => {
      const color = diseaseColors[diseaseName] || '#6B7280';
      
      return {
        label: diseaseName,
        data: sortedBarangays.map(([barangay]) => {
          // Sum cases for this disease across all months in this barangay
          return validResults
            .filter(r => r.barangay_name === barangay && r.disease_name === diseaseName)
            .reduce((sum, r) => sum + (r.forecast_cases || 0), 0);
        }),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4,
        barThickness: 'flex',
        maxBarThickness: 40
      };
    });

    return {
      labels: sortedBarangays.map(([barangay]) => barangay),
      datasets: datasets
    };
  }, [forecastResults]);

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
          }
        }
      },
      title: {
        display: true,
        text: 'Forecast by Barangay',
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
            return `${label}: ${value} predicted cases`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Barangay',
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
          color: '#6B7280'
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
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <FaChartBar className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Forecast Visualization</h3>
          <p className="text-sm text-gray-500">Predicted cases by barangay and disease (top 15 barangays)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Chart Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>• Bar chart showing forecast predictions</span>
            <span>• Hover for detailed information</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarangayForecastChart;

