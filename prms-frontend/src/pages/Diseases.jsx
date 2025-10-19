import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaVirus, FaExclamationTriangle, FaLungs, FaHeartbeat, FaThermometerHalf, FaStethoscope, FaShieldAlt, FaChartBar, FaEye } from "react-icons/fa";
import axios from "axios";
import DiseaseCaseForm from "../components/DiseaseCaseForm";
import AddDiseaseModal from "../components/AddDiseaseModal";
import DiseaseAnalytics from "../components/DiseaseAnalytics";
import DiseaseCasesModal from "../components/DiseaseCasesModal";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";
import "./Diseases.css";
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  listItemVariants,
  buttonVariants,
  hoverScale 
} from "../utils/animations";

const iconMap = {
  FaVirus: FaVirus,
  FaExclamationTriangle: FaExclamationTriangle,
  FaLungs: FaLungs,
  FaHeartbeat: FaHeartbeat,
  FaThermometerHalf: FaThermometerHalf
};

const getColorClasses = (color) => {
  const colorMap = {
    red: 'disease-header-red',
    orange: 'disease-header-orange',
    blue: 'disease-header-blue',
    green: 'disease-header-green',
    purple: 'disease-header-purple',
    yellow: 'disease-header-yellow',
    indigo: 'disease-header-indigo',
    pink: 'disease-header-pink'
  };
  return colorMap[color] || 'disease-header-blue';
};

function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiseaseCaseModal, setShowDiseaseCaseModal] = useState(false);
  const [showDiseaseCasesModal, setShowDiseaseCasesModal] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'management'

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      console.log('Fetching diseases from database...');
      const response = await axios.get("http://localhost/prms/prms-backend/get_diseases.php");
      console.log('Fetched diseases from API:', response.data);
      setDiseases(response.data);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      showToast("Error fetching diseases", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleAddDisease = () => {
    setEditingDisease(null);
    setShowAddModal(true);
  };

  const handleEditDisease = (disease) => {
    setEditingDisease(disease);
    setShowAddModal(true);
  };

  const handleDeleteDisease = (diseaseId) => {
    console.log('Delete button clicked for disease ID:', diseaseId);
    setConfirmModal({
      message: "Are you sure you want to delete this disease? This action cannot be undone.",
      onConfirm: () => {
        console.log('Confirm delete for disease ID:', diseaseId);
        deleteDisease(diseaseId);
        setConfirmModal(null);
      },
      onCancel: () => {
        console.log('Delete cancelled');
        setConfirmModal(null);
      }
    });
  };

  const deleteDisease = async (diseaseId) => {
    console.log('Starting delete process for disease ID:', diseaseId);
    try {
      console.log('Sending DELETE request to:', `http://localhost/prms/prms-backend/delete_disease.php`);
      const response = await axios.delete(`http://localhost/prms/prms-backend/delete_disease.php`, {
        data: { id: diseaseId }
      });
      console.log('Delete response:', response.data);
      showToast("Disease deleted successfully", "success");
      
      // Refresh the diseases list from database
      fetchDiseases();
    } catch (error) {
      console.error("Error deleting disease:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      showToast("Error deleting disease", "error");
    }
  };

  const handleViewDiseaseCases = (disease) => {
    setSelectedDisease(disease);
    setShowDiseaseCasesModal(true);
  };

  const handleDiseaseSubmit = (diseaseData) => {
    if (editingDisease) {
      setDiseases(diseases.map(d => d.id === editingDisease.id ? { ...d, ...diseaseData } : d));
      showToast("Disease updated successfully", "success");
    } else {
      setDiseases([...diseases, diseaseData]);
      showToast("Disease added successfully", "success");
    }
    setShowAddModal(false);
    setEditingDisease(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading diseases...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Modern Header with Controls */}
        <motion.div 
          className="mb-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div variants={cardVariants}>
              <h1 className="text-3xl font-bold text-blue-600">Disease Management</h1>
              <p className="text-gray-700 mt-2">Manage communicable diseases and track cases</p>
            </motion.div>
            
            {/* Controls on the right */}
            <div className="flex items-center space-x-4">
              {/* Add Disease Button */}
              <button
                onClick={handleAddDisease}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus className="h-4 w-4" />
                <span>Add Disease</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-6">
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
                onClick={() => setActiveTab('management')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'management'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaStethoscope className="inline h-4 w-4 mr-2" />
                Disease Management
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' ? (
          <DiseaseAnalytics />
        ) : (
          <>
            {/* Diseases Grid */}
            <div className="diseases-grid">
              {diseases.map((disease) => {
                const IconComponent = iconMap[disease.icon] || FaVirus;
                return (
                  <motion.div 
                    key={disease.id} 
                    className="disease-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={hoverScale}
                  >
                    {/* Disease Header */}
                    <div className={`${getColorClasses(disease.color)} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <IconComponent className="text-white text-xl" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{disease.name}</h3>
                            <p className="text-white/80 text-sm">{disease.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditDisease(disease)}
                            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200"
                            title="Edit Disease"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDisease(disease.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200"
                            title="Delete Disease"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Disease Details */}
                    <div className="disease-content">
                      <div className="space-y-4 flex-1">
                        {/* Symptoms */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Symptoms</h4>
                          <p className="text-sm text-gray-600 disease-symptoms">{disease.symptoms}</p>
                        </div>

                        {/* Incubation Period */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Incubation</h4>
                            <p className="text-sm text-gray-600">{disease.incubation_period}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Contagious</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{disease.contagious_period}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-gray-200 mt-auto">
                        <button
                          onClick={() => handleViewDiseaseCases(disease)}
                          className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                          <FaEye className="h-4 w-4 mr-2" />
                          View Cases
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {diseases.length === 0 && (
              <div className="text-center py-12">
                <FaStethoscope className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No diseases found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new disease.</p>
                <div className="mt-6">
                  <button
                    onClick={handleAddDisease}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <FaPlus className="h-4 w-4 mr-2" />
                    Add Disease
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDiseaseModal
          disease={editingDisease}
          onClose={() => {
            setShowAddModal(false);
            setEditingDisease(null);
          }}
          onConfirm={handleDiseaseSubmit}
        />
      )}

      {showDiseaseCaseModal && (
        <DiseaseCaseForm
          onClose={() => setShowDiseaseCaseModal(false)}
          onConfirm={(newCase) => {
            setShowDiseaseCaseModal(false);
            setSelectedDisease(null);
            // Show success message and refresh diseases data
            showToast(`Disease case for ${selectedDisease?.name} added successfully!`, "success");
            fetchDiseases(); // Refresh the diseases list
          }}
          disease={selectedDisease?.name}
        />
      )}

      {showDiseaseCasesModal && (
        <DiseaseCasesModal
          disease={selectedDisease?.name}
          onClose={() => {
            setShowDiseaseCasesModal(false);
            setSelectedDisease(null);
          }}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  );
}

export default Diseases;
