import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaWeight, FaEye, FaStethoscope, FaFileMedicalAlt, FaTimes, FaUserMd, FaFlask, FaPills, FaCommentMedical, FaHistory, FaEye as FaView } from "react-icons/fa";
import ModernToast from "./ModernToast";
import { formatPatientID } from "../utils/patientUtils";
import notificationService from "../utils/notificationService";

function MedicalRecords({ patient, onEdit, onDelete, onPatientUpdate }) {
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
      setLoading(true); // Reset loading state
      // Fetch current medical record (latest)
      axios.get(`http://localhost/prms/prms-backend/get_medical_records.php?patient_id=${patient.id}`)
        .then((res) => {
          console.log("Medical records response:", res.data);
          // Merge patient basic info with medical records data
          // Use medical records data to fill in missing patient information
          const mergedData = {
            ...patient, // Keep patient's basic info (name, ID, etc.)
            // Use medical records data to fill missing patient info
            surname: res.data.surname || patient.surname,
            first_name: res.data.first_name || patient.first_name,
            middle_name: res.data.middle_name || patient.middle_name,
            suffix: res.data.suffix || patient.suffix,
            date_of_birth: res.data.date_of_birth || patient.date_of_birth,
            philhealth_id: res.data.philhealth_id || patient.philhealth_id,
            priority: res.data.priority || patient.priority,
            address: res.data.address || patient.address,
            // Medical-specific fields
            blood_pressure: res.data.blood_pressure,
            temperature: res.data.temperature,
            height: res.data.height,
            weight: res.data.weight,
            chief_complaint: res.data.chief_complaint,
            place_of_consultation: res.data.place_of_consultation,
            type_of_services: res.data.type_of_services,
            date_of_consultation: res.data.date_of_consultation,
            health_provider: res.data.health_provider,
            diagnosis: res.data.diagnosis,
            laboratory_procedure: res.data.laboratory_procedure,
            prescribed_medicine: res.data.prescribed_medicine,
            medical_advice: res.data.medical_advice,
            place_of_consultation_medical: res.data.place_of_consultation_medical,
            date_of_consultation_medical: res.data.date_of_consultation_medical,
            health_provider_medical: res.data.health_provider_medical,
            medical_remarks: res.data.medical_remarks,
            created_at: res.data.created_at,
            updated_at: res.data.updated_at
          };
          console.log("Merged data:", mergedData);
          setMedicalRecord(mergedData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching medical records:", err);
          // If no medical records exist, use patient data
          setMedicalRecord(patient);
          setLoading(false);
        });

      // Fetch consultation history (all records)
      axios.get(`http://localhost/prms/prms-backend/get_all_medical_records.php?patient_id=${patient.id}`)
        .then((res) => {
          console.log("Consultation history response:", res.data);
          // Handle the API response structure properly
          let historyData = [];
          if (res.data && res.data.success) {
            // If response has success property, get data from res.data.data
            historyData = Array.isArray(res.data.data) ? res.data.data : [];
          } else if (Array.isArray(res.data)) {
            // If response is directly an array
            historyData = res.data;
          } else {
            // Fallback to empty array
            historyData = [];
          }
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
      const response = await axios.get(`http://localhost/prms/prms-backend/get_medical_record_by_id.php?record_id=${recordId}&patient_id=${patient.id}`);
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
        try {
          // Ensure we have a valid patient ID
          const patientId = patient?.id || medicalRecord?.id || patient?.patient_id;
          if (!patientId) {
            showToast("Error: Patient ID not found", "error");
            return;
          }
          
          const formData = { ...medicalRecord, id: patientId };
          
          // If name fields are changed, update the full_name for the patient
          if (formData.first_name || formData.surname || formData.middle_name || formData.suffix) {
            const full_name = `${formData.first_name || ''} ${formData.middle_name || ''} ${formData.surname || ''} ${formData.suffix || ''}`.trim();
            formData.full_name = full_name;
          }
          
          console.log('Patient object:', patient);
          console.log('Current medicalRecord state:', medicalRecord);
          console.log('Patient ID being used:', patientId);
          console.log('Sending medical records data:', formData);

        // Use comprehensive update API that handles both patient and medical records
        const response = await axios.post('http://localhost/prms/prms-backend/update_patient_comprehensive.php', formData);

        console.log('Response from server:', response.data);

        if (response.data.success) {
          showToast("Patient and medical records updated successfully.", "success", "Updated!");
          
          // Update local state with the saved data
          setMedicalRecord(formData);
          
          // Notify parent component about the update
          if (onPatientUpdate) {
            onPatientUpdate(formData);
          }
          
          // Send notification
          try {
            await notificationService.notifyMedicalRecordUpdated(
              formData.full_name || patient?.full_name || 'Patient'
            );
          } catch (error) {
            console.error('Error sending notification:', error);
          }
          
          // Toggle to read-only mode after successful save
          setIsEditing(false);
        } else {
          showToast("Save failed: " + (response.data.error || "Unknown error"), "error", "Update Failed!");
          // Don't toggle if save failed
        }
      } catch (error) {
        console.error("Save error:", error);
        showToast("An error occurred while saving: " + error.message, "error", "Connection Error!");
        // Don't toggle if save failed
      }
    } else {
      // Toggle to edit mode when clicking "Edit Medical Record"
      setIsEditing(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "family_medical_history") {
      let history = medicalRecord.family_medical_history?.split(",").map(s => s.trim()) || [];
      if (checked) history.push(value);
      else history = history.filter(item => item !== value);
      setMedicalRecord(prev => ({ ...prev, family_medical_history: [...new Set(history)].join(", ") }));
    } else if (type === "radio") {
      setMedicalRecord(prev => ({ ...prev, [name]: value }));
    } else {
      setMedicalRecord((prev) => ({ ...prev, [name]: value }));
    }
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

  const r = medicalRecord || {};
  
  // Debug logging
  console.log("Current medicalRecord state:", medicalRecord);
  console.log("Patient data:", patient);

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline h-4 w-4 mr-1" />
                Surname
              </label>
              {isEditing ? (
                <input
                  name="surname"
                  value={r.surname || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.surname || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline h-4 w-4 mr-1" />
                First Name
              </label>
              {isEditing ? (
                <input
                  name="first_name"
                  value={r.first_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.first_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline h-4 w-4 mr-1" />
                Middle Name
              </label>
              {isEditing ? (
                <input
                  name="middle_name"
                  value={r.middle_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.middle_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline h-4 w-4 mr-1" />
                Suffix
              </label>
              {isEditing ? (
                <input
                  name="suffix"
                  value={r.suffix || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.suffix || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={r.date_of_birth || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{fmtDate(r.date_of_birth) || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaVenusMars className="inline h-4 w-4 mr-1" />
                Sex
              </label>
              {isEditing ? (
                <select
                  name="sex"
                  value={r.sex || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">{r.sex || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUserMd className="inline h-4 w-4 mr-1" />
                PhilHealth ID No.
              </label>
              {isEditing ? (
                <input
                  name="philhealth_id"
                  value={r.philhealth_id || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.philhealth_id || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUserMd className="inline h-4 w-4 mr-1" />
                Priority
              </label>
              {isEditing ? (
                <select
                  name="priority"
                  value={r.priority || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              ) : (
                <p className="text-gray-900">{r.priority || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={r.address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              ) : (
                <p className="text-gray-900">{r.address || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. VITAL SIGNS Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaHeartbeat className="h-5 w-5 mr-2 text-yellow-600" />
            VITAL SIGNS
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Pressure
              </label>
              {isEditing ? (
                <input
                  name="blood_pressure"
                  placeholder="e.g., 120/80"
                  value={r.blood_pressure || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.blood_pressure || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              {isEditing ? (
                <input
                  name="temperature"
                  placeholder="e.g., 36.5°C"
                  value={r.temperature || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.temperature || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaWeight className="inline h-4 w-4 mr-1" />
                Height (cm)
              </label>
              {isEditing ? (
                <input
                  name="height"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 170.5"
                  value={r.height || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.height ? `${r.height} cm` : "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaWeight className="inline h-4 w-4 mr-1" />
                Weight (kg)
              </label>
              {isEditing ? (
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 65.5"
                  value={r.weight || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.weight ? `${r.weight} kg` : "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCommentMedical className="inline h-4 w-4 mr-1" />
                Chief Complaint
              </label>
              {isEditing ? (
                <textarea
                  name="chief_complaint"
                  value={r.chief_complaint || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter chief complaint..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{r.chief_complaint || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                Place of Consultation
              </label>
              {isEditing ? (
                <input
                  name="place_of_consultation"
                  value={r.place_of_consultation || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.place_of_consultation || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaStethoscope className="inline h-4 w-4 mr-1" />
                Type of Services
              </label>
              {isEditing ? (
                <input
                  name="type_of_services"
                  value={r.type_of_services || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.type_of_services || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                Date of Consultation
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_consultation"
                  value={r.date_of_consultation || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{fmtDate(r.date_of_consultation) || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUserMd className="inline h-4 w-4 mr-1" />
                Health Provider
              </label>
              {isEditing ? (
                <input
                  name="health_provider"
                  value={r.health_provider || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.health_provider || "Not recorded"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*  3. PATIENT'S MEDICAL RECORD Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaFileMedicalAlt className="h-5 w-5 mr-2 text-blue-600" />
            PATIENT'S MEDICAL RECORD
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaStethoscope className="inline h-4 w-4 mr-1" />
              Diagnosis
            </label>
            {isEditing ? (
              <textarea
                name="diagnosis"
                value={r.diagnosis || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter diagnosis..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{r.diagnosis || "No diagnosis recorded"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFlask className="inline h-4 w-4 mr-1" />
              Laboratory Procedure
            </label>
            {isEditing ? (
              <textarea
                name="laboratory_procedure"
                value={r.laboratory_procedure || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter laboratory procedures performed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{r.laboratory_procedure || "No laboratory procedures recorded"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPills className="inline h-4 w-4 mr-1" />
              Prescribed Medicine
            </label>
            {isEditing ? (
              <textarea
                name="prescribed_medicine"
                value={r.prescribed_medicine || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter prescribed medications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{r.prescribed_medicine || "No medications prescribed"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCommentMedical className="inline h-4 w-4 mr-1" />
              Medical Advice
            </label>
            {isEditing ? (
              <textarea
                name="medical_advice"
                value={r.medical_advice || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter medical advice and recommendations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{r.medical_advice || "No medical advice recorded"}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                Place of Consultation
              </label>
              {isEditing ? (
                <input
                  name="place_of_consultation_medical"
                  value={r.place_of_consultation_medical || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.place_of_consultation_medical || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                Date of Consultation
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_consultation_medical"
                  value={r.date_of_consultation_medical || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{fmtDate(r.date_of_consultation_medical) || "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUserMd className="inline h-4 w-4 mr-1" />
                Health Provider
              </label>
              {isEditing ? (
                <input
                  name="health_provider_medical"
                  value={r.health_provider_medical || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{r.health_provider_medical || "Not recorded"}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCommentMedical className="inline h-4 w-4 mr-1" />
              Medical Remarks
            </label>
            {isEditing ? (
              <textarea
                name="medical_remarks"
                value={r.medical_remarks || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter additional medical remarks..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{r.medical_remarks || "No additional remarks"}</p>
            )}
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
          {!Array.isArray(consultationHistory) || consultationHistory.length === 0 ? (
            <div className="text-center py-8">
              <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No consultation history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(consultationHistory) && consultationHistory.map((record, index) => (
                <div key={record.medical_record_id || record.id || index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {fmtDate(record.date_of_consultation) || 'No date'}
                        </h4>
                        {index === 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Diagnosis:</span>
                          <p className="text-gray-600">{record.diagnosis || 'Not recorded'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Provider:</span>
                          <p className="text-gray-600">{record.health_provider || record.health_provider_medical || 'Not recorded'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Chief Complaint:</span>
                          <p className="text-gray-600">{record.chief_complaint || 'Not recorded'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Treatment:</span>
                          <p className="text-gray-600">{record.prescribed_medicine || 'Not recorded'}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewRecord(record.medical_record_id || record.id)}
                      className="ml-4 inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                    >
                      <FaView className="h-4 w-4 mr-1" />
                      View Full Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Record - {fmtDate(selectedRecord.date_of_consultation)}
              </h3>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Display the selected record in the same format as current medical record */}
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedRecord.full_name || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span> {selectedRecord.age || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Sex:</span> {selectedRecord.sex || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Date of Birth:</span> {fmtDate(selectedRecord.date_of_birth) || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Vital Signs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Blood Pressure:</span> {selectedRecord.blood_pressure || 'Not recorded'}
                    </div>
                    <div>
                      <span className="font-medium">Temperature:</span> {selectedRecord.temperature || 'Not recorded'}
                    </div>
                    <div>
                      <span className="font-medium">Height:</span> {selectedRecord.height ? `${selectedRecord.height} cm` : 'Not recorded'}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span> {selectedRecord.weight ? `${selectedRecord.weight} kg` : 'Not recorded'}
                    </div>
                    <div>
                      <span className="font-medium">Chief Complaint:</span> {selectedRecord.chief_complaint || 'Not recorded'}
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

export default MedicalRecords;