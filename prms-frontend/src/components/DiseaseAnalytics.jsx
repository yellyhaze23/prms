import React, { useState, useEffect } from 'react';
import { FaStethoscope, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import DiseaseCard from './DiseaseCard';
import Toast from './Toast';

const DiseaseAnalytics = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  const fetchDiseaseAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost/prms/prms-backend/get_disease_analytics.php');
      
      if (response.data.success) {
        setDiseases(response.data.diseases);
      } else {
        showToast('Failed to fetch disease analytics', 'error');
      }
    } catch (error) {
      console.error('Error fetching disease analytics:', error);
      showToast('Error loading disease data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDiseaseAnalytics();
  };


  useEffect(() => {
    fetchDiseaseAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading disease analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaStethoscope className="text-blue-600 mr-3" />
              Disease Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Top 5 Communicable Diseases - Statistics & Monitoring</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-150"
          >
            <FaSync className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStethoscope className="text-blue-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Diseases</p>
              <p className="text-2xl font-bold text-gray-900">{diseases.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaStethoscope className="text-green-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {diseases.reduce((sum, d) => sum + d.total_cases, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {diseases.filter(d => d.risk_level === 'High').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Cards */}
      {diseases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaStethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Disease Data Available</h3>
          <p className="text-gray-500">Start by adding patient medical records with disease diagnoses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map((disease, index) => (
            <DiseaseCard
              key={disease.disease}
              disease={disease.disease}
              totalCases={disease.total_cases}
              activeCases={disease.active_cases}
              riskLevel={disease.risk_level}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DiseaseAnalytics;
