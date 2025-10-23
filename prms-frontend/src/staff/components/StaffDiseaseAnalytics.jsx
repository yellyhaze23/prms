import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStethoscope, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import api from '../../lib/api/axios';
import Toast from '../../components/Toast';
import { cardVariants } from '../../utils/animations';

const StaffDiseaseAnalytics = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  const fetchDiseaseAnalytics = async () => {
    try {
      const response = await api.get('/disease-analytics.php');
      
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
    }
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

  const totalCases = diseases.reduce((sum, d) => sum + d.total_cases, 0);
  const activeCases = diseases.reduce((sum, d) => sum + d.active_cases, 0);
  const highRiskCount = diseases.filter(d => d.risk_level === 'High').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white border rounded-lg p-6 shadow-sm"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaStethoscope className="text-blue-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Diseases Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{diseases.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white border rounded-lg p-6 shadow-sm"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaChartLine className="text-green-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{totalCases}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white border rounded-lg p-6 shadow-sm"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-red-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Risk</p>
              <p className="text-2xl font-bold text-gray-900">{highRiskCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Disease Statistics Table */}
      <motion.div 
        className="bg-white border rounded-lg shadow-sm overflow-hidden"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Disease Statistics</h3>
          <p className="text-sm text-gray-500 mt-1">Cases from your assigned patients</p>
        </div>
        
        {diseases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Disease
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Total Cases
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Active (30 days)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Recent (7 days)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diseases.map((disease, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaStethoscope className="text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{disease.disease}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {disease.total_cases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {disease.active_cases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {disease.recent_cases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        disease.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                        disease.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {disease.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaStethoscope className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No disease data</h3>
            <p className="mt-1 text-sm text-gray-500">No disease cases found for your patients yet.</p>
          </div>
        )}
      </motion.div>

      {toast?.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
};

export default StaffDiseaseAnalytics;

