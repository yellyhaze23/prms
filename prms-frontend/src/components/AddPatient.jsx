import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaSave, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars } from "react-icons/fa";
import Toast from "./Toast"; 

function AddPatient({ onClose, onConfirm, patient = null }) {

  const [formData, setFormData] = useState({
    full_name: patient?.full_name || "",
    date_of_birth: patient?.date_of_birth || "",
    sex: patient?.sex || "",
    contact_number: patient?.contact_number || "",
    email: patient?.email || "",
    address: patient?.address || "",
  });

  const [toast, setToast] = useState(null); 

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {}, [patient]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Image upload removed

  const handleSubmit = async () => {
    const { full_name, date_of_birth, sex, address } = formData;

    if (!full_name || !date_of_birth || !sex || !address) {
      showToast("Please fill in all required fields (Name, Date of Birth, Gender, Address)", "error");
      return;
    }

    const url = patient
      ? "http://localhost/prms/prms-backend/update_patient.php"
      : "http://localhost/prms/prms-backend/add_patient.php";

    const body = patient
      ? { id: patient.id, ...formData }
      : { ...formData };

    console.log('Sending data:', body);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error("Empty response from server");
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      onConfirm(patient ? { ...patient, ...formData } : result.data || result);
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
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline h-4 w-4 mr-2" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
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

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline h-4 w-4 mr-2" />
                  Contact Number <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  placeholder="e.g. 09123456789"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline h-4 w-4 mr-2" />
                  Email <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. patient@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
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
