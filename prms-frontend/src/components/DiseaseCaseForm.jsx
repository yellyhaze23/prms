import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaUser, FaCalendarAlt, FaStethoscope, FaPhone, FaEnvelope, FaSearch } from "react-icons/fa";
import axios from "axios";
import Toast from "./Toast";
import { formatPatientID } from "../utils/patientUtils";

// Disease options will be fetched from database


function DiseaseCaseForm({ onClose, onConfirm, patient = null, disease = null }) {
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patient || null);
  
  const [formData, setFormData] = useState({
    patient_id: patient?.id || "",
    disease: disease || "",
    onset_date: "",
    diagnosis_date: "",
    symptoms: "",
    treatment: "",
    medical_advice: "",
    notes: "",
    reported_by: "",
    reported_date: new Date().toISOString().split('T')[0]
  });

  // Set disease when component mounts if disease prop is provided
  useEffect(() => {
    if (disease) {
      setFormData(prev => ({ ...prev, disease: disease }));
    }
  }, [disease]);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Fetch patients from database
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_patients.php`)
      .then((res) => {
        setPatients(res.data);
        setFilteredPatients(res.data);
      })
      .catch((err) => {
        console.error("Error fetching patients:", err);
        showToast("Error fetching patients", "error");
      });

    // Fetch diseases from database
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_diseases.php`)
      .then((res) => {
        setDiseases(res.data);
      })
      .catch((err) => {
        console.error("Error fetching diseases:", err);
        showToast("Error fetching diseases", "error");
      });
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    if (patientSearchTerm) {
      const filtered = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        formatPatientID(patient.id).includes(patientSearchTerm) ||
        (patient.contact_number && patient.contact_number.includes(patientSearchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase()))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [patientSearchTerm, patients]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Function to fetch patient's existing medical records
  const fetchPatientMedicalRecords = async (patientId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_medical_records.php?patient_id=${patientId}`);
      if (response.data) {
        // Pre-populate form with existing medical records
        setFormData(prev => ({
          ...prev,
          diagnosis: response.data.diagnosis || "",
          symptoms: response.data.symptoms || "",
          treatment: response.data.treatment || "",
          medical_advice: response.data.medical_advice || "",
          notes: response.data.notes || "",
          onset_date: response.data.onset_date || "",
          diagnosis_date: response.data.diagnosis_date || ""
        }));
        showToast("Patient medical records loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching patient medical records:", error);
      // Don't show error toast as it's optional
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patient_id: patient.id }));
    setPatientSearchTerm(patient.full_name);
    setShowPatientDropdown(false);
    
    // Auto-fetch patient's medical records
    fetchPatientMedicalRecords(patient.id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPatientDropdown && !event.target.closest('.patient-selector')) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPatientDropdown]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedPatient || !formData.patient_id || !formData.disease || !formData.onset_date) {
      showToast("Please select a patient and fill in all required fields", "error");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add_disease_case.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to add disease case");

      // Show detailed success message
      const successMessage = `Disease case added successfully! Patient: ${selectedPatient?.full_name}, Disease: ${formData.disease}`;
      showToast(successMessage, "success");
      
      // Close modal after a short delay to show the toast
      setTimeout(() => {
        onConfirm(result);
        onClose();
      }, 1500);
    } catch (error) {
      showToast("Error: " + error.message, "error");
    }
  };

  const selectedDisease = diseases.find(d => d.name === formData.disease);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Add Disease Case
            {selectedDisease && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {selectedDisease.name}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FaUser className="h-4 w-4 mr-2 text-blue-600" />
              Patient Information
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Patient <span className="text-red-500">*</span>
                </label>
                <div className="relative patient-selector">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={patientSearchTerm}
                    onChange={(e) => {
                      setPatientSearchTerm(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search patients by name, or patient ID..."
                  />
                  
                  {/* Patient Dropdown */}
                  {showPatientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaUser className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{patient.full_name}</p>
                                <p className="text-xs text-gray-500">
                                  ID: #{formatPatientID(patient.id)} • {patient.sex} • {patient.age ? `${patient.age} years old` : 'Age N/A'}
                                </p>
                                {patient.contact_number && (
                                  <p className="text-xs text-gray-500">
                                    <FaPhone className="inline h-3 w-3 mr-1" />
                                    {patient.contact_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No patients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Patient Info */}
              {selectedPatient && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Selected Patient</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-blue-700 font-medium">Name:</span>
                      <p className="text-sm text-blue-800">{selectedPatient.full_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-700 font-medium">ID:</span>
                      <p className="text-sm text-blue-800">#{formatPatientID(selectedPatient.id)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-700 font-medium">Gender:</span>
                      <p className="text-sm text-blue-800">{selectedPatient.sex}</p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-700 font-medium">Age:</span>
                      <p className="text-sm text-blue-800">{selectedPatient.age ? `${selectedPatient.age} years old` : 'N/A'}</p>
                    </div>
                    {selectedPatient.contact_number && (
                      <div>
                        <span className="text-xs text-blue-700 font-medium">Contact:</span>
                        <p className="text-sm text-blue-800">{selectedPatient.contact_number}</p>
                      </div>
                    )}
                    {selectedPatient.email && (
                      <div>
                        <span className="text-xs text-blue-700 font-medium">Email:</span>
                        <p className="text-sm text-blue-800">{selectedPatient.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disease Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FaStethoscope className="h-4 w-4 mr-2 text-red-600" />
              Disease Information
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disease <span className="text-red-500">*</span>
              </label>
              <select
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">{diseases.length === 0 ? "Loading diseases..." : "Select Disease"}</option>
                {diseases.map(disease => (
                  <option key={disease.id} value={disease.name}>
                    {disease.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                Onset Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="onset_date"
                value={formData.onset_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                Diagnosis Date
              </label>
              <input
                type="date"
                name="diagnosis_date"
                value={formData.diagnosis_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>


          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaStethoscope className="inline h-4 w-4 mr-1" />
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe the symptoms observed..."
            />
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaStethoscope className="inline h-4 w-4 mr-1" />
              Treatment
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe the treatment provided..."
            />
          </div>

          {/* Medical Advice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaStethoscope className="inline h-4 w-4 mr-1" />
              Medical Advice
            </label>
            <textarea
              name="medical_advice"
              value={formData.medical_advice}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Provide medical advice and recommendations..."
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Any additional information..."
            />
          </div>

          {/* Reporter Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FaUser className="h-4 w-4 mr-2 text-blue-600" />
              Reporter Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reported By
                </label>
                <input
                  type="text"
                  name="reported_by"
                  value={formData.reported_by}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter reporter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Date
                </label>
                <input
                  type="date"
                  name="reported_date"
                  value={formData.reported_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              <FaSave className="h-4 w-4 mr-2" />
              Add Disease Case
            </button>
          </div>
        </form>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default DiseaseCaseForm;

