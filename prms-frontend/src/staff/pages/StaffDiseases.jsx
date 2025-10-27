import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStethoscope, FaVirus, FaExclamationTriangle, FaLungs, FaHeartbeat, FaThermometerHalf, FaChartBar, FaEye } from 'react-icons/fa';
import api from '../../lib/api/axios';
import StaffDiseaseAnalytics from '../components/StaffDiseaseAnalytics';
import ModernToast from '../../components/ModernToast';
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../../utils/animations';

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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      const response = await api.get('/get_diseases.php');
      setDiseases(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching diseases:', error);
      setToast({
        type: 'error',
        message: 'Failed to load diseases. Please try again.'
      });
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
    <motion.div 
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modern Header - Enhanced like Admin Portal */}
      <motion.div 
        className="mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-blue-600">Disease Management</h1>
            <p className="text-gray-700 mt-2">View disease information and analytics</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        className="mb-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
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
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <StaffDiseaseAnalytics />
      ) : (
        <motion.div 
          className="space-y-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
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
                        <h3 className="text-xl font-bold text-white drop-shadow-sm">{disease.name}</h3>
                        <p className="text-white/90 text-sm">{disease.description}</p>
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
        </motion.div>
      )}

      {/* Modern Toast Notification */}
      {toast && (
        <ModernToast
          isVisible={true}
          title={toast.type === 'success' ? 'Success!' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </motion.div>
  );
}

