import React, { useState, useEffect } from 'react';
import { FaStethoscope, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import DiseaseCard from './DiseaseCard';
import CaseTrendsChart from './CaseTrendsChart';
import Toast from './Toast';
import CountUp from './CountUp';
import '../pages/Dashboard.css';

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="modern-summary-card">
          <div className="flex items-center">
            <div className="modern-icon-container bg-blue-50">
              <FaStethoscope className="text-blue-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="modern-card-label">Total Diseases</p>
              <p className="modern-card-value">
                <CountUp end={diseases.length} duration={2000} />
              </p>
            </div>
          </div>
        </div>

        <div className="modern-summary-card">
          <div className="flex items-center">
            <div className="modern-icon-container bg-green-50">
              <FaStethoscope className="text-green-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="modern-card-label">Total Cases</p>
              <p className="modern-card-value">
                <CountUp end={diseases.reduce((sum, d) => sum + d.total_cases, 0)} duration={2000} />
              </p>
            </div>
          </div>
        </div>

        <div className="modern-summary-card">
          <div className="flex items-center">
            <div className="modern-icon-container bg-red-50">
              <FaExclamationTriangle className="text-red-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="modern-card-label">High Risk</p>
              <p className="modern-card-value">
                <CountUp end={diseases.filter(d => d.risk_level === 'High').length} duration={2000} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Case Trends Chart */}
      <CaseTrendsChart />

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
