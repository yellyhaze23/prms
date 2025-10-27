import React from 'react';
import { FaStethoscope, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';

const DiseaseCard = ({ disease, totalCases, activeCases, riskLevel }) => {

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <FaExclamationTriangle className="text-red-500" />;
      case 'Medium': return <FaClock className="text-yellow-500" />;
      case 'Low': return <FaCheckCircle className="text-green-500" />;
      default: return <FaStethoscope className="text-gray-500" />;
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FaStethoscope className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{disease}</h3>
            <p className="text-sm text-gray-500">Communicable Disease</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRiskColor(riskLevel)}`}>
          {getRiskIcon(riskLevel)}
          <span>{riskLevel} Risk</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">{totalCases}</div>
          <div className="text-sm text-gray-600">Total Cases</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{activeCases}</div>
          <div className="text-sm text-gray-600">Active Cases</div>
        </div>
      </div>


    </div>
  );
};

export default DiseaseCard;

