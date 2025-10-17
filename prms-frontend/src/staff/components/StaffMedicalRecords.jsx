import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaWeight, FaEye, FaStethoscope, FaFileMedicalAlt, FaTimes, FaUserMd, FaFlask, FaPills, FaCommentMedical, FaHistory, FaEye as FaView, FaIdCard, FaCog, FaWeightHanging, FaThermometer, FaRuler, FaComment, FaMapMarkerAlt as FaLocationDot, FaStethoscope as FaStethoscopeIcon, FaCalendar, FaUserMd as FaUserDoctor } from "react-icons/fa";
import ModernToast from "../../components/ModernToast";
import { formatPatientID } from "../../utils/patientUtils";

function StaffMedicalRecords({ patient, onEdit, onDelete, onPatientUpdate }) {
  const [medicalRecord, setMedicalRecord] = useState({});
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", title = null) => {
    setToast({ 
      isVisible: true, 
      message, 
      type,
      title: title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info!')
    });
  };

  useEffect(() => {
    if (patient?.id) {
      // Fetch current medical record (latest) using staff API
      axios.get(`http://localhost/prms/prms-backend/api/staff/medical-records/get.php?patient_id=${patient.id}`)
        .then((res) => {
          console.log("Medical record response:", res.data);
          // The API already returns merged patient and medical record data
          setMedicalRecord(res.data);
        })
        .catch((err) => {
          console.error("Error fetching medical records:", err);
          // If no medical records exist, use patient data
          setMedicalRecord(patient);
        });

      // Fetch consultation history (all records) using staff API
      axios.get(`http://localhost/prms/prms-backend/api/staff/medical-records/get-all.php?patient_id=${patient.id}`)
        .then((res) => {
          console.log("Consultation history response:", res.data);
          // Ensure we always have an array
          const historyData = Array.isArray(res.data) ? res.data : [];
          console.log("Processed history data:", historyData);
          setConsultationHistory(historyData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching consultation history:", err);
          setConsultationHistory([]);
          setLoading(false);
        });
    } else {
      setMedicalRecord({});
      setConsultationHistory([]);
      setLoading(false);
    }
  }, [patient]);

  // Initialize editing state to false when component loads
  useEffect(() => {
    if (patient && !loading) {
      setIsEditing(false);
    }
  }, [patient, loading]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  const handleViewRecord = async (recordId) => {
    try {
      const response = await axios.get(`http://localhost/prms/prms-backend/api/staff/medical-records/get-by-id.php?record_id=${recordId}&patient_id=${patient.id}`);
      setSelectedRecord(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching record:", error);
      showToast("Error loading medical record", "error");
    }
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedRecord(null);
  };

  const toggleEdit = async () => {
    if (isEditing) {
      // Save changes
      try {
        const response = await axios.post(
          `http://localhost/prms/prms-backend/api/staff/medical-records/update.php`,
          {
            patient_id: patient.id,
            ...medicalRecord
          }
        );
        
        if (response.data.success) {
          showToast("Medical record updated successfully", "success", "Updated!");
          setIsEditing(false);
          
          // Refresh data
          const res = await axios.get(`http://localhost/prms/prms-backend/api/staff/medical-records/get.php?patient_id=${patient.id}`);
          const mergedData = {
            ...patient,
            ...res.data
          };
          setMedicalRecord(mergedData);
        } else {
          showToast("Failed to update medical record", "error", "Update Failed!");
        }
      } catch (error) {
        console.error("Error updating medical record:", error);
        showToast("Error updating medical record", "error", "Connection Error!");
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleFieldChange = (field, value) => {
    setMedicalRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!patient || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FaFileMedicalAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {!patient ? "No patient selected." : "Loading medical record…"}
          </p>
        </div>
      </div>
    );
  }

  // Use medicalRecord data, but fallback to patient data for missing fields
  const r = {
    ...patient,
    ...medicalRecord
  };


  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">{patient.full_name || "Unknown Patient"}</h1>
                <p className="text-blue-100">Patient ID: #{formatPatientID(patient.id)}</p>
              </div>
          </div>
        </div>
      </div>

      {/* Medical Record Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaFileMedicalAlt className="h-6 w-6 mr-3 text-blue-600" />
            Medical Records
          </h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={toggleEdit}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <FaSave className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <FaEdit className="h-4 w-4 mr-2" />
                Edit Medical Record
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. INFORMATION Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUser className="h-5 w-5 mr-2 text-green-600" />
            INFORMATION
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <FaUser className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Surname</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.surname || ""}
                    onChange={(e) => handleFieldChange('surname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.surname || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaUser className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">First Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.first_name || ""}
                    onChange={(e) => handleFieldChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.first_name || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaUser className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Middle Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.middle_name || ""}
                    onChange={(e) => handleFieldChange('middle_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.middle_name || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaUser className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Suffix</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.suffix || ""}
                    onChange={(e) => handleFieldChange('suffix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.suffix || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={r.date_of_birth || ""}
                    onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{fmtDate(r.date_of_birth) || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaVenusMars className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Sex</p>
                {isEditing ? (
                  <select
                    value={r.sex || ""}
                    onChange={(e) => handleFieldChange('sex', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{r.sex || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaIdCard className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">PhilHealth ID No.</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.philhealth_id || ""}
                    onChange={(e) => handleFieldChange('philhealth_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.philhealth_id || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCog className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Priority</p>
                {isEditing ? (
                  <select
                    value={r.priority || ""}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{r.priority || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 md:col-span-2">
              <FaMapMarkerAlt className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                {isEditing ? (
                  <textarea
                    value={r.address || ""}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    rows="3"
                    placeholder="Enter full address..."
                  />
                ) : (
                  <p className="text-gray-900">{r.address || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VITAL SIGNS Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaHeartbeat className="h-5 w-5 mr-2 text-orange-600" />
            VITAL SIGNS
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <FaWeightHanging className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Blood Pressure</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.blood_pressure || ""}
                    onChange={(e) => handleFieldChange('blood_pressure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.blood_pressure || "Not recorded"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaThermometer className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Temperature</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.temperature || ""}
                    onChange={(e) => handleFieldChange('temperature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.temperature || "Not recorded"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaRuler className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Height (cm)</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={r.height || ""}
                    onChange={(e) => handleFieldChange('height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.height ? `${r.height} cm` : "Not recorded"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaWeight className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Weight (kg)</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={r.weight || ""}
                    onChange={(e) => handleFieldChange('weight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.weight ? `${r.weight} kg` : "Not recorded"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaComment className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Chief Complaint</p>
                {isEditing ? (
                  <textarea
                    value={r.chief_complaint || ""}
                    onChange={(e) => handleFieldChange('chief_complaint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    rows="4"
                    placeholder="Enter chief complaint details..."
                  />
                ) : (
                  <p className="text-gray-900">{r.chief_complaint || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaLocationDot className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Place of Consultation</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.place_of_consultation || ""}
                    onChange={(e) => handleFieldChange('place_of_consultation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.place_of_consultation || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaStethoscopeIcon className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Type of Services</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.type_of_services || ""}
                    onChange={(e) => handleFieldChange('type_of_services', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.type_of_services || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendar className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date of Consultation</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={r.date_of_consultation || ""}
                    onChange={(e) => handleFieldChange('date_of_consultation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{fmtDate(r.date_of_consultation) || "Not specified"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaUserDoctor className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Health Provider</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={r.health_provider || ""}
                    onChange={(e) => handleFieldChange('health_provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{r.health_provider || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PATIENT'S MEDICAL RECORD Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaFileMedicalAlt className="h-5 w-5 mr-2 text-blue-600" />
            PATIENT'S MEDICAL RECORD
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaStethoscope className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Diagnosis</p>
              </div>
              {isEditing ? (
                <textarea
                  value={r.diagnosis || ""}
                  onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="4"
                  placeholder="Enter diagnosis details..."
                />
              ) : (
                <p className="text-gray-900">{r.diagnosis || "No diagnosis recorded"}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaFlask className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Laboratory Procedure</p>
              </div>
              {isEditing ? (
                <textarea
                  value={r.laboratory_procedure || ""}
                  onChange={(e) => handleFieldChange('laboratory_procedure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="4"
                  placeholder="Enter laboratory procedures..."
                />
              ) : (
                <p className="text-gray-900">{r.laboratory_procedure || "No laboratory procedures recorded"}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaPills className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Prescribed Medicine</p>
              </div>
              {isEditing ? (
                <textarea
                  value={r.prescribed_medicine || ""}
                  onChange={(e) => handleFieldChange('prescribed_medicine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="4"
                  placeholder="Enter prescribed medications..."
                />
              ) : (
                <p className="text-gray-900">{r.prescribed_medicine || "No medications prescribed"}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaCommentMedical className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Medical Advice</p>
              </div>
              {isEditing ? (
                <textarea
                  value={r.medical_advice || ""}
                  onChange={(e) => handleFieldChange('medical_advice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="4"
                  placeholder="Enter medical advice..."
                />
              ) : (
                <p className="text-gray-900">{r.medical_advice || "No medical advice recorded"}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaLocationDot className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Place of Consultation</p>
              </div>
              {isEditing ? (
                <textarea
                  value={r.place_of_consultation || ""}
                  onChange={(e) => handleFieldChange('place_of_consultation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="3"
                  placeholder="Enter place of consultation..."
                />
              ) : (
                <p className="text-gray-900">{r.place_of_consultation || "Not specified"}</p>
              )}
            </div>
            <div>
              <div className="flex items-start space-x-3">
                <FaCalendar className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Date of Consultation</p>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={r.date_of_consultation || ""}
                  onChange={(e) => handleFieldChange('date_of_consultation', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{fmtDate(r.date_of_consultation) || "Not specified"}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaUserDoctor className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Health Provider</p>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={r.health_provider || ""}
                  onChange={(e) => handleFieldChange('health_provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.health_provider || "Not specified"}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FaCommentMedical className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-700">Medical Remarks</p>
              </div>
              {isEditing ? (
                <textarea
                  value={r.medical_remarks || ""}
                  onChange={(e) => handleFieldChange('medical_remarks', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows="4"
                  placeholder="Enter medical remarks..."
                />
              ) : (
                <p className="text-gray-900">{r.medical_remarks || "No additional remarks"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONSULTATION HISTORY Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaHistory className="h-5 w-5 mr-2 text-purple-600" />
            CONSULTATION HISTORY
          </h3>
        </div>
        <div className="p-6">
          {consultationHistory.length > 0 ? (
            <div className="space-y-4">
              {consultationHistory.map((record, index) => (
                <div key={record.medical_record_id || index} className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendarAlt className="h-4 w-4 mr-1" />
                          {fmtDate(record.date_of_consultation) || fmtDate(record.created_at)}
                        </div>
                        {index === 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Latest</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                          <p className="text-gray-900">{record.diagnosis || "No diagnosis"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Provider:</p>
                          <p className="text-gray-900">{record.health_provider || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Chief Complaint:</p>
                          <p className="text-gray-900">{record.chief_complaint || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Treatment:</p>
                          <p className="text-gray-900">{record.prescribed_medicine || "No treatment recorded"}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewRecord(record.medical_record_id)}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 ml-4"
                    >
                      <FaView className="h-4 w-4 mr-1" />
                      View Full Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaHistory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consultation history available</p>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Medical Record Details</h3>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-gray-600">{selectedRecord.first_name} {selectedRecord.middle_name} {selectedRecord.surname} {selectedRecord.suffix}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date of Birth:</span>
                    <p className="text-gray-600">{fmtDate(selectedRecord.date_of_birth)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Barangay:</span>
                    <p className="text-gray-600">{selectedRecord.barangay || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">PhilHealth ID:</span>
                    <p className="text-gray-600">{selectedRecord.philhealth_id || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Blood Pressure:</span>
                    <p className="text-gray-600">{selectedRecord.blood_pressure || 'Not recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Temperature:</span>
                    <p className="text-gray-600">{selectedRecord.temperature || 'Not recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Height:</span>
                    <p className="text-gray-600">{selectedRecord.height ? `${selectedRecord.height} cm` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span>
                    <p className="text-gray-600">{selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Consultation Details</h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium">Chief Complaint:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.chief_complaint || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Place of Consultation:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.place_of_consultation || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type of Services:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.type_of_services || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date of Consultation:</span>
                    <p className="text-gray-600 mt-1">{fmtDate(selectedRecord.date_of_consultation)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Health Provider:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.health_provider || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Medical Record */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Medical Record</h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium">Diagnosis:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.diagnosis || 'No diagnosis recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Laboratory Procedure:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.laboratory_procedure || 'No laboratory procedures recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Prescribed Medicine:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.prescribed_medicine || 'No medications prescribed'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Medical Advice:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.medical_advice || 'No medical advice recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Medical Remarks:</span>
                    <p className="text-gray-600 mt-1">{selectedRecord.medical_remarks || 'No additional remarks'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <ModernToast
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          type={toast.type}
          title={toast.title}
          message={toast.message}
        />
      )}
    </div>
  );
}

export default StaffMedicalRecords;