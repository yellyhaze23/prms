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
import { FaChartLine, FaFilter } from 'react-icons/fa';
import axios from 'axios';

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

const CaseTrendsChart = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // Fixed to 7 days only
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [availableDiseases, setAvailableDiseases] = useState([]);

  const fetchTrendsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_disease_trends.php?period=${selectedPeriod}`);
      
      if (response.data.success) {
        setTrendsData(response.data);
        setAvailableDiseases(response.data.diseases || []);
        if (selectedDiseases.length === 0) {
          // Auto-select all diseases initially
          setSelectedDiseases(response.data.diseases || []);
        }
      }
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, [selectedPeriod]);

  const handleDiseaseToggle = (disease) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) 
        ? prev.filter(d => d !== disease)
        : [...prev, disease]
    );
  };

  const generateChartData = () => {
    if (!trendsData || !trendsData.trends) return null;

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

    const datasets = selectedDiseases.map((disease, index) => {
      const diseaseData = trendsData.trends[disease];
      if (!diseaseData) return null;

      return {
        label: disease,
        data: diseaseData.cases,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      };
    }).filter(Boolean);

    return {
      labels: trendsData.trends[selectedDiseases[0]]?.dates || [],
      datasets
    };
  };

  // Calculate dynamic y-axis maximum
  const getMaxValue = () => {
    if (!trendsData || !trendsData.trends) return 5;
    
    let maxValue = 0;
    selectedDiseases.forEach(disease => {
      const diseaseData = trendsData.trends[disease];
      if (diseaseData && diseaseData.cases) {
        const diseaseMax = Math.max(...diseaseData.cases);
        maxValue = Math.max(maxValue, diseaseMax);
      }
    });
    
    // Return 5 as default, or the actual max if it's higher than 5
    return Math.max(5, Math.ceil(maxValue));
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
          }
        }
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
            return `Date: ${context[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} cases`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
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
          text: 'Number of Cases',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        min: 0,
        max: getMaxValue(),
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: Math.ceil(getMaxValue() / 5),
          callback: function(value) {
            return value;
          }
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading trends data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaChartLine className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Case Trends Analysis</h3>
            <p className="text-sm text-gray-500">Disease cases over time</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">Last 7 days</span>
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
        {generateChartData() ? (
          <Line
            data={generateChartData()}
            options={chartOptions}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No trend data available</p>
              <p className="text-sm">Select diseases to view trends</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseTrendsChart;

