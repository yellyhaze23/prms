import React, { useState, useEffect } from 'react';
import { FaStethoscope, FaVirus, FaExclamationTriangle, FaLungs, FaHeartbeat, FaThermometerHalf, FaChartBar, FaEye } from 'react-icons/fa';
import api from '../../lib/api/axios';

const iconMap = {
  FaVirus: FaVirus,
  FaExclamationTriangle: FaExclamationTriangle,
  FaLungs: FaLungs,
  FaHeartbeat: FaHeartbeat,
  FaThermometerHalf: FaThermometerHalf
};

const getColorClasses = (color) => {
  const colorMap = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500'
  };
  return colorMap[color] || 'bg-blue-500';
};

export default function StaffDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      const response = await api.get('/get_diseases.php');
      setDiseases(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading diseases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Disease Management</h1>
          <p className="text-slate-600 mt-1">View disease information and analytics</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaChartBar className="inline h-4 w-4 mr-2" />
            Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab('diseases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'diseases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaStethoscope className="inline h-4 w-4 mr-2" />
            Disease Information
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaStethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Diseases</p>
                  <p className="text-2xl font-bold text-gray-900">{diseases.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">High Risk Diseases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {diseases.filter(d => d.color === 'red' || d.color === 'orange').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaVirus className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Contagious Diseases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {diseases.filter(d => d.contagious_period && d.contagious_period !== 'N/A').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disease Overview */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diseases.map((disease) => {
                const IconComponent = iconMap[disease.icon] || FaVirus;
                return (
                  <div key={disease.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(disease.color)}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{disease.name}</h4>
                        <p className="text-sm text-gray-500">{disease.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Diseases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases.map((disease) => {
              const IconComponent = iconMap[disease.icon] || FaVirus;
              return (
                <div key={disease.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  {/* Disease Header */}
                  <div className={`${getColorClasses(disease.color)} p-4`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <IconComponent className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{disease.name}</h3>
                        <p className="text-white/80 text-sm">{disease.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Disease Details */}
                  <div className="p-4 space-y-4">
                    {/* Symptoms */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Symptoms</h4>
                      <p className="text-sm text-gray-600">{disease.symptoms}</p>
                    </div>

                    {/* Incubation Period */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Incubation</h4>
                        <p className="text-sm text-gray-600">{disease.incubation_period}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Contagious</h4>
                        <p className="text-sm text-gray-600">{disease.contagious_period}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {diseases.length === 0 && (
            <div className="text-center py-12">
              <FaStethoscope className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No diseases found</h3>
              <p className="mt-1 text-sm text-gray-500">No disease information available at this time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
