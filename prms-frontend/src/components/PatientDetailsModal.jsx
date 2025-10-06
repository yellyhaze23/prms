import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaHeartbeat, FaWeight, FaEye } from 'react-icons/fa';

const PatientDetailsModal = ({ isVisible, onClose, patient }) => {
  if (!isVisible || !patient) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden mx-auto transform transition-all relative" style={{ maxWidth: '800px', maxHeight: '80vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FaUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{patient.full_name || "Unknown Patient"}</h2>
                <p className="text-blue-100">Patient ID: #{patient.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(80vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Personal Information */}
            <div className="flex flex-col space-y-3 h-full">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Personal Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <FaIdCard className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Patient ID:</span>
                    <span className="ml-2 font-medium">#{patient.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUser className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Full Name:</span>
                    <span className="ml-2 font-medium">{patient.full_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaVenusMars className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Sex:</span>
                    <span className="ml-2 font-medium">{patient.sex || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Age:</span>
                    <span className="ml-2 font-medium">{patient.age ? `${patient.age} years old` : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Birth Date:</span>
                    <span className="ml-2 font-medium">{formatDate(patient.birth_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col space-y-3 h-full">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaPhone className="text-green-600" />
                Contact Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{patient.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{patient.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-500 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="ml-2 font-medium block">{patient.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="flex flex-col space-y-3 h-full">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaHeartbeat className="text-red-600" />
                Medical Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <FaWeight className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Weight:</span>
                    <span className="ml-2 font-medium">{patient.weight ? `${patient.weight} kg` : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEye className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Height:</span>
                    <span className="ml-2 font-medium">{patient.height ? `${patient.height} cm` : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaHeartbeat className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-600">Blood Type:</span>
                    <span className="ml-2 font-medium">{patient.blood_type || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaUser className="text-gray-500 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-sm text-gray-600">Emergency Contact:</span>
                    <span className="ml-2 font-medium block">{patient.emergency_contact || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="flex flex-col space-y-3 h-full">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaIdCard className="text-purple-600" />
                Additional Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 flex-1">
                <div className="flex items-start gap-3">
                  <FaUser className="text-gray-500 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-sm text-gray-600">Allergies:</span>
                    <span className="ml-2 font-medium block">{patient.allergies || 'None reported'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaHeartbeat className="text-gray-500 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-sm text-gray-600">Medical History:</span>
                    <span className="ml-2 font-medium block">{patient.medical_history || 'None reported'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-gray-500 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-sm text-gray-600">Last Visit:</span>
                    <span className="ml-2 font-medium">{formatDate(patient.last_visit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PatientDetailsModal;
