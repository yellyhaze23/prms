import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaSave, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaIdCard, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import ModernToast from "../../components/ModernToast";

function StaffAddPatient({ onClose, onConfirm, patient = null }) {
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
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Parse full_name into name components if editing existing patient
  useEffect(() => {
    if (patient?.id && patient.full_name && !patient.first_name) {
      // For staff patients, parse full_name into individual components
      const nameParts = patient.full_name.trim().split(' ');
      const parsedNames = {
        first_name: nameParts[0] || "",
        middle_name: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : "",
        surname: nameParts[nameParts.length - 1] || "",
        suffix: ""
      };
      
      setFormData(prev => ({
        ...prev,
        ...parsedNames,
        date_of_birth: patient.date_of_birth || "",
        sex: patient.sex || "",
        address: patient.address || "",
        philhealth_id: patient.philhealth_id || "",
        priority: patient.priority || "medium",
      }));
    }
  }, [patient]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      showToast("First name is required", "error");
      return false;
    }
    if (!formData.surname.trim()) {
      showToast("Surname is required", "error");
      return false;
    }
    if (!formData.date_of_birth) {
      showToast("Date of birth is required", "error");
      return false;
    }
    if (!formData.sex) {
      showToast("Gender is required", "error");
      return false;
    }
    if (!formData.address.trim()) {
      showToast("Address is required", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Combine name fields into full_name
      const full_name = `${formData.first_name} ${formData.middle_name} ${formData.surname} ${formData.suffix}`.trim();
      
      const url = patient 
        ? `http://localhost/prms/prms-backend/api/staff/patients/update.php`
        : `http://localhost/prms/prms-backend/api/staff/patients/add.php`;

      const payload = {
        full_name: full_name,
        age: calculateAge(formData.date_of_birth),
        sex: formData.sex,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        // Include name components for medical records
        surname: formData.surname,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        suffix: formData.suffix,
        philhealth_id: formData.philhealth_id,
        priority: formData.priority
      };

      if (patient) {
        payload.id = patient.id;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('staff_token') || ''}`
        }
      });

      if (response.data.success) {
        showToast(patient ? "Patient updated successfully" : "Patient added successfully", "success");
        setTimeout(() => {
          onConfirm(response.data.data);
          onClose();
        }, 1000);
      } else {
        throw new Error(response.data.error || "Failed to save patient");
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      showToast(error.response?.data?.error || error.message || "Failed to save patient", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-slate-900/50 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4" 
      style={{ margin: 0 }}
    >
      <div className="relative mx-auto w-full max-w-2xl my-4">
        <div className="bg-white rounded-xl shadow-2xl ring-1 ring-slate-900/10">
          {/* Header */}
          <div className="px-6 py-3 border-b flex items-center justify-between">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

                {/* Surname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  placeholder="Street, house number, landmarks, etc."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Footer */}
            <div className="pt-4 border-t flex items-center justify-end gap-2 bg-slate-50 -mx-6 -mb-4 px-6 py-3 rounded-b-xl">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {patient ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <FaSave className="h-4 w-4 mr-2" />
                    {patient ? "Update Patient Record" : "Add Patient Record"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <ModernToast
          isVisible={true}
          title={toast.type === 'success' ? 'Success!' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
}

export default StaffAddPatient;
