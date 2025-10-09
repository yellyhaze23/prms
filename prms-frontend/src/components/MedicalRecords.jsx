import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaWeight, FaEye, FaStethoscope, FaFileMedicalAlt, FaTimes, FaUserMd, FaFlask, FaPills, FaCommentMedical } from "react-icons/fa";
import Toast from "./Toast";
import { formatPatientID } from "../utils/patientUtils";

function MedicalRecords({ patient, onEdit, onDelete, onPatientUpdate }) {
  const [medicalRecord, setMedicalRecord] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (patient?.id) {
      // Fetch medical records data
      axios.get(`http://localhost/prms/prms-backend/get_medical_records.php?patient_id=${patient.id}`)
        .then((res) => {
          // Merge patient basic info with medical records data
          const mergedData = {
            ...patient,
            ...res.data
          };
          setMedicalRecord(mergedData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching medical records:", err);
          // If no medical records exist, use patient data
          setMedicalRecord(patient);
          setLoading(false);
        });
    } else {
      setMedicalRecord({});
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

  const toggleEdit = async () => {
    if (isEditing) {
        try {
          const formData = { ...medicalRecord, id: patient.id };
          
          // If name fields are changed, update the full_name for the patient
          if (formData.first_name || formData.surname || formData.middle_name || formData.suffix) {
            const full_name = `${formData.first_name || ''} ${formData.middle_name || ''} ${formData.surname || ''} ${formData.suffix || ''}`.trim();
            formData.full_name = full_name;
          }
          
          console.log('Current medicalRecord state:', medicalRecord);
          console.log('Sending medical records data:', formData);

        // Use comprehensive update API that handles both patient and medical records
        const response = await axios.post('http://localhost/prms/prms-backend/update_patient_comprehensive.php', formData);

        console.log('Response from server:', response.data);

        if (response.data.success) {
          showToast("Patient and medical records updated successfully.", "success");
          
          // Update local state with the saved data
          setMedicalRecord(formData);
          
          // Notify parent component about the update
          if (onPatientUpdate) {
            onPatientUpdate(formData);
          }
          
          // Toggle to read-only mode after successful save
          setIsEditing(false);
        } else {
          showToast("Save failed: " + (response.data.error || "Unknown error"), "error");
          // Don't toggle if save failed
        }
      } catch (error) {
        console.error("Save error:", error);
        showToast("An error occurred while saving: " + error.message, "error");
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

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
}

export default MedicalRecords;