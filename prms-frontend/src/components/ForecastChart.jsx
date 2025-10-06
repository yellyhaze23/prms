import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { FaDownload, FaChartLine } from 'react-icons/fa';

const ForecastChart = ({ forecastData, historicalData, diseaseName, forecastPeriod }) => {
  const [showAllDiseases, setShowAllDiseases] = useState(false);

  // Process data for chart
  const chartData = useMemo(() => {
    if (!forecastData) return [];
    
    // If no historical data, just show forecast data
    if (!historicalData || !Array.isArray(historicalData)) {
      const forecastOnly = forecastData.map(item => ({
        month: item.forecast_month,
        date: new Date(item.forecast_month + '-01'),
        isHistorical: false,
        [item.disease_name]: item.forecast_cases
      }));
      return forecastOnly.sort((a, b) => a.date - b.date);
    }

    const processedData = [];
    const diseaseData = historicalData.filter(item => 
      diseaseName ? item.disease_name === diseaseName : true
    );

    // Group by month and year
    const groupedData = {};
    
    // Process historical data
    diseaseData.forEach(item => {
      const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          month: key,
          date: new Date(item.year, item.month - 1),
          isHistorical: true
        };
      }
      groupedData[key][item.disease_name] = item.total_cases;
    });

    // Process forecast data
    forecastData.forEach(item => {
      const key = item.forecast_month;
      if (!groupedData[key]) {
        groupedData[key] = {
          month: key,
          date: new Date(item.forecast_month + '-01'),
          isHistorical: false
        };
      }
      groupedData[key][item.disease_name] = item.forecast_cases;
    });

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => a.date - b.date);
  }, [forecastData, historicalData, diseaseName]);

  // Get unique diseases for legend
  const diseases = useMemo(() => {
    if (!chartData.length) return [];
    const diseaseSet = new Set();
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'month' && key !== 'date' && key !== 'isHistorical') {
          diseaseSet.add(key);
        }
      });
    });
    return Array.from(diseaseSet);
  }, [chartData]);

  // Color palette for different diseases
  const getDiseaseColor = (disease) => {
    const colors = {
      'Chickenpox': '#ef4444', // red-500
      'Dengue': '#f97316', // orange-500
      'Hepatitis': '#eab308', // yellow-500
      'Measles': '#22c55e', // green-500
      'Tuberculosis': '#a855f7', // purple-500
      'All Diseases': '#3b82f6' // blue-500
    };
    return colors[disease] || '#6b7280'; // gray-500
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value} cases
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Export chart as PNG
  const exportChart = () => {
    const chartElement = document.querySelector('.forecast-chart');
    if (chartElement) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // This is a simplified export - in a real implementation, you'd use a library like html2canvas
      const link = document.createElement('a');
      link.download = `forecast-chart-${diseaseName || 'all-diseases'}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Export data as CSV
  const exportData = () => {
    const csvContent = [
      ['Month', 'Disease', 'Cases', 'Type'],
      ...chartData.flatMap(item => 
        Object.entries(item)
          .filter(([key, value]) => key !== 'month' && key !== 'date' && key !== 'isHistorical' && typeof value === 'number')
          .map(([disease, cases]) => [
            item.month,
            disease,
            cases,
            item.isHistorical ? 'Historical' : 'Forecast'
          ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast-data-${diseaseName || 'all-diseases'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <FaChartLine className="text-4xl mx-auto mb-4 text-gray-300" />
          <p>No chart data available</p>
          <p className="text-sm text-gray-400 mt-2">
            {!forecastData ? 'No forecast data' : 'No historical data to display'}
          </p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        {/* Chart Header */}
        <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Forecast Visualization
            </h3>
            <p className="text-sm text-gray-600">
              {diseaseName ? `${diseaseName} Forecast` : 'All Diseases Forecast'} - {forecastPeriod} months
            </p>
          </div>
          <div className="flex items-center gap-2">

          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        <div className="forecast-chart bg-white rounded-lg" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Cases', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference line to separate historical and forecast */}
              <ReferenceLine 
                x={chartData.find(item => !item.isHistorical)?.month} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                label={{ value: "Forecast Start", position: "top" }}
              />

              {/* Render lines for each disease */}
              {diseases.map((disease, index) => (
                <Line
                  key={disease}
                  type="monotone"
                  dataKey={disease}
                  stroke={getDiseaseColor(disease)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={disease}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Historical Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Forecasted Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>ARIMA Model (1,1,1)</span>
          </div>
        </div>
      </div>

    </div>
    );
  } catch (error) {
    console.error('Error rendering ForecastChart:', error);
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-red-500">
          <FaChartLine className="text-4xl mx-auto mb-4 text-red-300" />
          <p>Error loading chart</p>
          <p className="text-sm text-gray-400 mt-2">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }
};

export default ForecastChart;
