import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaHeartbeat, FaWeight, FaEye, FaStethoscope, FaUserMd, FaFlask, FaPills, FaCommentMedical } from 'react-icons/fa';
import { formatPatientID } from '../utils/patientUtils';

const PatientDetailsModal = ({ isVisible, onClose, patient }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && patient?.id) {
      setLoading(true);
      // Fetch complete patient data including medical records
      axios.get(`http://localhost/prms/prms-backend/get_medical_records.php?patient_id=${patient.id}`)
        .then((res) => {
          // Merge patient basic info with medical records data
          const mergedData = {
            ...patient,
            ...res.data
          };
          setPatientData(mergedData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching patient details:", err);
          // If no medical records exist, use patient data
          setPatientData(patient);
          setLoading(false);
        });
    } else {
      setPatientData(patient);
    }
  }, [isVisible, patient]);

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

  if (loading) {
    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
      >
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>,
      document.body
    );
  }

  // Parse full_name into individual components if not available
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
      // 4 or more parts - assume last is surname, first is first name, rest is middle name
      return { 
        surname: parts[parts.length - 1], 
        first_name: parts[0], 
        middle_name: parts.slice(1, -1).join(' '), 
        suffix: '' 
      };
    }
  };

  const rawData = patientData || patient;
  const parsedName = parseFullName(rawData.full_name);
  
  // Merge data with parsed name components
  const data = {
    ...rawData,
    ...parsedName
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
          <div className="flex items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">{data.full_name || "Unknown Patient"}</h2>
                <p className="text-blue-100">Patient ID: #{formatPatientID(data.id)}</p>
              </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Personal Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaIdCard className="text-blue-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Patient ID</p>
                        <p className="text-lg font-semibold text-gray-900">#{formatPatientID(data.id)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">First Name</p>
                        <p className="text-lg font-semibold text-gray-900">{data.first_name || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Middle Name</p>
                        <p className="text-lg font-semibold text-gray-900">{data.middle_name || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Surname</p>
                        <p className="text-lg font-semibold text-gray-900">{data.surname || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Suffix</p>
                        <p className="text-lg font-semibold text-gray-900">{data.suffix || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <FaVenusMars className="text-pink-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sex</p>
                        <p className="text-lg font-semibold text-gray-900">{data.sex || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-purple-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Age</p>
                        <p className="text-lg font-semibold text-gray-900">{data.age ? `${data.age} years old` : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-purple-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Birth Date</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(data.date_of_birth)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                        <FaMapMarkerAlt className="text-orange-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Address</p>
                        <p className="text-lg font-semibold text-gray-900">{data.address || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FaUserMd className="text-indigo-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">PhilHealth ID</p>
                        <p className="text-lg font-semibold text-gray-900">{data.philhealth_id || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FaUserMd className="text-indigo-600 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Priority</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{data.priority || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PatientDetailsModal;
