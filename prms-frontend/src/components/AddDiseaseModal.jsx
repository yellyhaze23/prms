import React, { useState } from "react";
import { FaTimes, FaSave, FaVirus, FaExclamationTriangle, FaLungs, FaHeartbeat, FaThermometerHalf } from "react-icons/fa";
import Toast from "./Toast";

const iconOptions = [
  { value: "FaVirus", label: "Virus", icon: FaVirus, color: "red" },
  { value: "FaExclamationTriangle", label: "Warning", icon: FaExclamationTriangle, color: "orange" },
  { value: "FaLungs", label: "Lungs", icon: FaLungs, color: "blue" },
  { value: "FaHeartbeat", label: "Heart", icon: FaHeartbeat, color: "green" },
  { value: "FaThermometerHalf", label: "Thermometer", icon: FaThermometerHalf, color: "purple" }
];

const colorOptions = [
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "yellow", label: "Yellow" },
  { value: "indigo", label: "Indigo" },
  { value: "pink", label: "Pink" }
];

const getColorClasses = (color) => {
  const colorMap = {
    red: 'border-red-500 bg-red-50 text-red-600',
    orange: 'border-orange-500 bg-orange-50 text-orange-600',
    blue: 'border-blue-500 bg-blue-50 text-blue-600',
    green: 'border-green-500 bg-green-50 text-green-600',
    purple: 'border-purple-500 bg-purple-50 text-purple-600',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-600',
    indigo: 'border-indigo-500 bg-indigo-50 text-indigo-600',
    pink: 'border-pink-500 bg-pink-50 text-pink-600'
  };
  return colorMap[color] || 'border-blue-500 bg-blue-50 text-blue-600';
};

function AddDiseaseModal({ onClose, onConfirm, disease = null }) {
  const [formData, setFormData] = useState({
    name: disease?.name || "",
    description: disease?.description || "",
    symptoms: disease?.symptoms || "",
    incubation_period: disease?.incubation_period || "",
    contagious_period: disease?.contagious_period || "",
    color: disease?.color || "blue",
    icon: disease?.icon || "FaVirus"
  });

  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    // Validation
    if (!formData.name || !formData.description || !formData.symptoms) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = disease
        ? "http://localhost/prms-backend/update_disease.php"
        : "http://localhost/prms-backend/add_disease.php";

      const body = disease
        ? { id: disease.id, ...formData }
        : formData;


      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to save disease");

      onConfirm(result);
      onClose();
    } catch (error) {
      showToast("Error: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedIcon = iconOptions.find(option => option.value === formData.icon);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {disease ? "Edit Disease" : "Add New Disease"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disease Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter disease name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Theme
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {colorOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter disease description"
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Medical Information</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Common Symptoms <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter common symptoms (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incubation Period
                  </label>
                  <input
                    type="text"
                    name="incubation_period"
                    value={formData.incubation_period}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., 10-21 days"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contagious Period
                  </label>
                  <input
                    type="text"
                    name="contagious_period"
                    value={formData.contagious_period}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., 1-2 days before rash"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Icon Selection</h4>
            <div className="grid grid-cols-5 gap-3">
              {iconOptions.map(option => {
                const IconComponent = option.icon;
                const isSelected = formData.icon === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                    className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                      isSelected
                        ? getColorClasses(option.color)
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <IconComponent className={`h-6 w-6 mx-auto ${
                      isSelected ? 'text-current' : 'text-gray-400'
                    }`} />
                    <p className={`text-xs mt-1 ${
                      isSelected ? 'text-current' : 'text-gray-500'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
            {selectedIcon && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedIcon.label} icon
                </p>
              </div>
            )}
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
              disabled={isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaSave className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : (disease ? "Update Disease" : "Add Disease")}
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

export default AddDiseaseModal;

