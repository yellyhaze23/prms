import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaSave, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaIdCard, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import Toast from "./Toast";
import { formatPatientID, generateNextPatientID } from "../utils/patientUtils"; 

function AddPatient({ onClose, onConfirm, patient = null }) {

  const [formData, setFormData] = useState({
    // Name fields (separate components)
    surname: patient?.surname || "",
    first_name: patient?.first_name || "",
    middle_name: patient?.middle_name || "",
    suffix: patient?.suffix || "",
    // Basic patient info
    date_of_birth: patient?.date_of_birth || "",
    sex: patient?.sex || "",
    address: patient?.address || "",
    // Medical records fields
    philhealth_id: patient?.philhealth_id || "",
    priority: patient?.priority || "medium",
  });

  const [toast, setToast] = useState(null); 

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (patient?.id) {
      console.log("Patient data for editing:", patient);
      
      // Check if this is staff context (has full_name but no individual name fields)
      const isStaffContext = window.location.pathname.includes('/staff');
      
      if (isStaffContext && patient.full_name && !patient.first_name) {
        // For staff patients, parse full_name into individual components
        const nameParts = patient.full_name.trim().split(' ');
        const parsedNames = {
          first_name: nameParts[0] || "",
          middle_name: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : "",
          surname: nameParts[nameParts.length - 1] || "",
          suffix: ""
        };
        
        setFormData({
          surname: parsedNames.surname,
          first_name: parsedNames.first_name,
          middle_name: parsedNames.middle_name,
          suffix: parsedNames.suffix,
          date_of_birth: patient.date_of_birth || "",
          sex: patient.sex || "",
          address: patient.address || "",
          philhealth_id: patient.philhealth_id || "",
          priority: patient.priority || "medium",
        });
      } else {
        // For admin patients or patients with individual name fields, use existing logic
        // Try to fetch medical records data for additional fields
        axios.get(`http://localhost/prms/prms-backend/get_medical_records.php?patient_id=${patient.id}`)
          .then((res) => {
            console.log("Medical records response:", res.data);
            // Merge patient basic info with medical records data
            const mergedData = {
              ...patient,
              ...res.data
            };
            
            // Update form data with the merged data
            setFormData({
              surname: mergedData.surname || "",
              first_name: mergedData.first_name || "",
              middle_name: mergedData.middle_name || "",
              suffix: mergedData.suffix || "",
              date_of_birth: mergedData.date_of_birth || patient.date_of_birth || "",
              sex: mergedData.sex || patient.sex || "",
              address: mergedData.address || patient.address || "",
              philhealth_id: mergedData.philhealth_id || "",
              priority: mergedData.priority || "medium",
            });
          })
          .catch((err) => {
            console.error("Error fetching medical records:", err);
            // If no medical records exist, use patient data directly
            setFormData({
              surname: patient.surname || "",
              first_name: patient.first_name || "",
              middle_name: patient.middle_name || "",
              suffix: patient.suffix || "",
              date_of_birth: patient.date_of_birth || "",
              sex: patient.sex || "",
              address: patient.address || "",
              philhealth_id: patient.philhealth_id || "",
              priority: patient.priority || "medium",
            });
          });
      }
    } else {
      // Reset form for new patient
      setFormData({
        surname: "",
        first_name: "",
        middle_name: "",
        suffix: "",
        date_of_birth: "",
        sex: "",
        address: "",
        philhealth_id: "",
        priority: "medium",
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };


  const handleSubmit = async () => {
    console.log('Form data:', formData);
    console.log('Patient data:', patient);
    
    const { first_name, date_of_birth, sex, address } = formData;

    if (!first_name || !date_of_birth || !sex || !address) {
      showToast("Please fill in all required fields (First Name, Date of Birth, Gender, Address)", "error");
      return;
    }

    // Combine name fields into full_name for backward compatibility
    const full_name = `${formData.first_name} ${formData.middle_name} ${formData.surname} ${formData.suffix}`.trim();

    // Determine if this is staff context by checking the current URL
    const isStaffContext = window.location.pathname.includes('/staff');
    
    const url = patient
      ? (isStaffContext 
          ? "http://localhost/prms/prms-backend/api/staff/patients/update.php"
          : "http://localhost/prms/prms-backend/update_patient_comprehensive.php")
      : (isStaffContext
          ? "http://localhost/prms/prms-backend/api/staff/patients/add.php"
          : "http://localhost/prms/prms-backend/add_patient.php");

    // Prepare body based on context
    let body;
    if (patient) {
      if (isStaffContext) {
        // Staff API expects specific fields
        body = {
          id: patient.id,
          full_name: full_name,
          age: calculateAge(formData.date_of_birth),
          sex: formData.sex,
          address: formData.address,
          date_of_birth: formData.date_of_birth
        };
      } else {
        // Admin API expects all fields
        body = { id: patient.id, full_name, ...formData };
      }
    } else {
      // For adding new patients
      if (isStaffContext) {
        // Staff add API expects specific fields
        body = {
          full_name: full_name,
          age: calculateAge(formData.date_of_birth),
          sex: formData.sex,
          address: formData.address,
          date_of_birth: formData.date_of_birth
        };
      } else {
        // Admin add API expects all fields
        body = { full_name, ...formData };
      }
    }

    console.log('Sending data:', body);
    console.log('URL:', url);

    try {
      console.log('Making request to:', url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!responseText.trim()) {
        throw new Error("Empty response from server");
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed result:', result);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (patient) {
        // For editing, create a proper updated patient object
        const updatedPatient = {
          ...patient,
          full_name: full_name,
          ...formData
        };
        console.log('Updated patient data:', updatedPatient);
        onConfirm(updatedPatient);
      } else {
        // For adding new patient
        onConfirm(result.data || result);
      }
      onClose();
    } catch (error) {
      showToast("Error: " + error.message, "error");
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 overflow-y-auto">
      <div className="relative top-16 mx-auto w-11/12 max-w-2xl">
        <div className="bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/10">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {patient ? "Edit Patient Record" : "Add New Patient Record"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Fill in the required fields marked with <span className="text-red-500">*</span>
              </p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700" aria-label="Close">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline h-4 w-4 mr-2" />
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline h-4 w-4 mr-2" />
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="surname"
                    placeholder="Enter surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline h-4 w-4 mr-2" />
                    Middle Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    placeholder="Enter middle name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  />
                </div>

                {/* Suffix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline h-4 w-4 mr-2" />
                    Suffix <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="suffix"
                    placeholder="e.g. Jr., Sr., III"
                    value={formData.suffix}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline h-4 w-4 mr-2" />
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaVenusMars className="inline h-4 w-4 mr-2" />
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>


              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline h-4 w-4 mr-2" />
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>

              {/* Additional Medical Record Fields */}
              <div>
                {/* PhilHealth ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaIdCard className="inline h-4 w-4 mr-2" />
                    PhilHealth ID No. <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="philhealth_id"
                      placeholder="12 digits (e.g., 123456789012)"
                      value={formData.philhealth_id}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        if (value.length <= 12) {
                          setFormData(prev => ({ ...prev, philhealth_id: value }));
                        }
                      }}
                      maxLength={12}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm ${
                        formData.philhealth_id && formData.philhealth_id.length > 0
                          ? formData.philhealth_id.length === 12
                            ? "border-green-300 focus:ring-green-500"
                            : "border-yellow-300 focus:ring-yellow-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {formData.philhealth_id && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {formData.philhealth_id.length === 12 ? (
                          <FaCheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.philhealth_id && formData.philhealth_id.length > 0 && formData.philhealth_id.length < 12 && (
                    <p className="mt-1 text-sm text-yellow-600 flex items-center">
                      <FaExclamationTriangle className="h-3 w-3 mr-1" />
                      {formData.philhealth_id.length}/12 digits
                    </p>
                  )}
                  {formData.philhealth_id && formData.philhealth_id.length === 12 && (
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <FaCheckCircle className="h-3 w-3 mr-1" />
                      Valid PhilHealth ID format
                    </p>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline h-4 w-4 mr-2" />
                  Priority <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-end gap-2 bg-slate-50 rounded-b-xl">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150">
              Cancel
            </button>
            <button onClick={handleSubmit} className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
              <FaSave className="h-4 w-4 mr-2" />
              {patient ? "Update Patient Record" : "Add Patient Record"}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default AddPatient;
