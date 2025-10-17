import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaIdCard, FaCog, FaTimes } from 'react-icons/fa';
import { formatPatientID } from '../../utils/patientUtils';

function StaffPatientDetailsModal({ patient, isOpen, onClose }) {
  const [patientData, setPatientData] = useState(null);

  // Parse full_name into individual components
  const parseFullName = (fullName) => {
    if (!fullName) return { surname: '', first_name: '', middle_name: '', suffix: '' };
    
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { surname: parts[0], first_name: '', middle_name: '', suffix: '' };
    } else if (parts.length === 2) {
      return { surname: parts[1], first_name: parts[0], middle_name: '', suffix: '' };
    } else if (parts.length === 3) {
      return { surname: parts[2], first_name: parts[0], middle_name: parts[1], suffix: '' };
    } else {
      return { 
        surname: parts[parts.length - 1], 
        first_name: parts[0], 
        middle_name: parts.slice(1, -1).join(' '), 
        suffix: '' 
      };
    }
  };

  useEffect(() => {
    if (patient) {
      console.log("=== STAFF PATIENT DETAILS MODAL DEBUG ===");
      console.log("Patient data received:", patient);
      console.log("Patient full_name:", patient.full_name);
      
      const parsedName = parseFullName(patient.full_name);
      console.log("Parsed name:", parsedName);
      
      const mergedData = {
        ...patient,
        ...parsedName
      };
      console.log("Final patient data:", mergedData);
      console.log("=== END DEBUG ===");
      
      setPatientData(mergedData);
    }
  }, [patient]);

  console.log("Modal render check - isOpen:", isOpen, "patientData:", patientData);
  
  if (!isOpen || !patientData) {
    console.log("Modal not rendering - isOpen:", isOpen, "patientData:", patientData);
    return null;
  }

  // Test alert to verify modal is working
  console.log("Modal is rendering! Patient data:", patientData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{patientData.full_name}</h2>
              <p className="text-blue-100">Patient ID: #{formatPatientID(patientData.id)}</p>
              <p className="text-blue-100 text-sm">NEW MODAL WORKING!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <FaUser className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Patient ID</p>
                    <p className="text-gray-900">#{formatPatientID(patientData.id)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaUser className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">First Name</p>
                    <p className="text-gray-900">{patientData.first_name || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaUser className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Middle Name</p>
                    <p className="text-gray-900">{patientData.middle_name || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaUser className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Surname</p>
                    <p className="text-gray-900">{patientData.surname || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaUser className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Suffix</p>
                    <p className="text-gray-900">{patientData.suffix || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaVenusMars className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sex</p>
                    <p className="text-gray-900">{patientData.sex || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Age</p>
                    <p className="text-gray-900">{patientData.age ? `${patientData.age} years old` : "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Birth Date</p>
                    <p className="text-gray-900">{patientData.date_of_birth ? new Date(patientData.date_of_birth).toLocaleDateString() : "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-gray-900">{patientData.address || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffPatientDetailsModal;
