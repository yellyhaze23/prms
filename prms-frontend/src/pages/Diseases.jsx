import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaVirus, FaExclamationTriangle, FaLungs, FaHeartbeat, FaThermometerHalf, FaStethoscope, FaShieldAlt, FaChartLine, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import DiseaseCaseForm from "../components/DiseaseCaseForm";
import AddDiseaseModal from "../components/AddDiseaseModal";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";
import "./Diseases.css";

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
  const [editingDisease, setEditingDisease] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      const response = await axios.get("http://localhost/prms/prms-backend/get_diseases.php");
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
    setConfirmModal({
      message: "Are you sure you want to delete this disease? This action cannot be undone.",
      onConfirm: () => {
        deleteDisease(diseaseId);
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const deleteDisease = async (diseaseId) => {
    try {
      await axios.delete(`http://localhost/prms/prms-backend/delete_disease.php`, {
        data: { id: diseaseId }
      });
      setDiseases(diseases.filter(d => d.id !== diseaseId));
      showToast("Disease deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting disease:", error);
      showToast("Error deleting disease", "error");
    }
  };

  const handleAddDiseaseCase = (disease) => {
    setSelectedDisease(disease);
    setShowDiseaseCaseModal(true);
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FaStethoscope className="h-8 w-8 mr-3" />
                Disease Management
              </h1>
              <p className="text-red-100 mt-2">Manage communicable diseases and track cases</p>
            </div>
            <button
              onClick={handleAddDisease}
              className="inline-flex items-center px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Disease
            </button>
          </div>
        </div>

        {/* Diseases Grid */}
        <div className="diseases-grid">
          {diseases.map((disease) => {
            const IconComponent = iconMap[disease.icon] || FaVirus;
            return (
              <div key={disease.id} className="disease-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  <div className="space-y-4">
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

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAddDiseaseCase(disease)}
                        className="action-button flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        <FaPlus className="h-4 w-4 mr-1" />
                        Add Case
                      </button>
                      <button className="action-button inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                        <FaChartLine className="h-4 w-4" />
                      </button>
                      <button className="action-button inline-flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                        <FaMapMarkerAlt className="h-4 w-4" />
                      </button>
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
    </div>
  );
}

export default Diseases;
