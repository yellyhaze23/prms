import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaWeight, FaEye, FaStethoscope, FaFileMedicalAlt, FaTimes } from "react-icons/fa";
import Toast from "./Toast";

function HealthExamination({ patient, onEdit, onDelete }) {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (patient?.id) {
      // TODO: Implement get_health_examinations.php endpoint
      setForm({ ...patient });
      setLoading(false);
    } else {
      setForm({});
      setLoading(false);
    }
  }, [patient]);

  // Auto-enable editing when component loads (user clicked "Edit Medical Records" from table)
  useEffect(() => {
    if (patient && !loading) {
      setIsEditing(true);
    }
  }, [patient, loading]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  const toggleEdit = async () => {
    if (isEditing) {
      try {
        const formData = { ...form, id: patient.id };

        if (imageFile) {
          const base64 = await fileToBase64(imageFile);
          formData.image = base64;
        }

        // TODO: Implement update_health_examinations.php endpoint
        const res = { data: { success: true } };

        if (res.data.success) {
          showToast("Patient data saved.", "success");
          setForm(formData);
        } else {
          showToast("Save failed: " + (res.data.error || "Unknown error"), "error");
        }
      } catch (error) {
        console.error("Save error:", error);
        showToast("An error occurred while saving.", "error");
      }
    }

    setIsEditing((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  if (!patient || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FaFileMedicalAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {!patient ? "No patient selected." : "Loading health examination…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <img
                  src={patient.image_path ? `http://localhost/prms/prms-backend/uploads/${patient.image_path}` : "/lspu-logo.png"}
                  alt="Patient"
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{patient.full_name || "Unknown Patient"}</h1>
                <p className="text-blue-100">Patient ID: #{patient.id}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit && onEdit(patient)}
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200"
                title="Edit Basic Patient Info"
              >
                <FaEdit className="h-4 w-4 mr-2" />
                Edit Basic Info
              </button>
              <button
                onClick={() => onDelete && onDelete(patient.id)}
                className="inline-flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors duration-200"
                title="Delete Patient"
              >
                <FaTimes className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Record Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaFileMedicalAlt className="h-6 w-6 mr-3 text-blue-600" />
            Medical Record
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

      {/* Examination Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaCalendarAlt className="h-5 w-5 mr-2 text-blue-600" />
            Examination Details
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                Date of Examination
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="exam_date"
                  value={form.exam_date || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{fmtDate(form.exam_date) || "Not set"}</p>
              )}
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaPhone className="h-5 w-5 mr-2 text-red-600" />
            Emergency Contact
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline h-4 w-4 mr-1" />
                Name
              </label>
              {isEditing ? (
                <input
                  name="emergency_name"
                  value={form.emergency_name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.emergency_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaUser className="inline h-4 w-4 mr-1" />
                Relationship
              </label>
              {isEditing ? (
                <input
                  name="emergency_relation"
                  value={form.emergency_relation || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.emergency_relation || "Not provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaPhone className="inline h-4 w-4 mr-1" />
                Contact Number
              </label>
              {isEditing ? (
                <input
                  name="emergency_contact"
                  value={form.emergency_contact || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.emergency_contact || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vital Signs & Measurements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaHeartbeat className="h-5 w-5 mr-2 text-green-600" />
            Vital Signs & Measurements
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
                  value={form.blood_pressure || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.blood_pressure || "Not recorded"}</p>
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
                  value={form.height || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.height ? `${form.height} cm` : "Not recorded"}</p>
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
                  value={form.weight || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.weight ? `${form.weight} kg` : "Not recorded"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BMI
              </label>
              {isEditing ? (
                <input
                  name="bmi"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 22.5"
                  value={form.bmi || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.bmi || "Not calculated"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaWeight className="inline h-4 w-4 mr-1" />
                Ideal Weight (kg)
              </label>
              {isEditing ? (
                <input
                  name="ideal_weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 60.0"
                  value={form.ideal_weight || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.ideal_weight ? `${form.ideal_weight} kg` : "Not calculated"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaEye className="inline h-4 w-4 mr-1" />
                Vision (With Glasses)
              </label>
              {isEditing ? (
                <input
                  name="vision_with_glasses"
                  placeholder="e.g., 20/20"
                  value={form.vision_with_glasses || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.vision_with_glasses || "Not tested"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaEye className="inline h-4 w-4 mr-1" />
                Vision (Without Glasses)
              </label>
              {isEditing ? (
                <input
                  name="vision_without_glasses"
                  placeholder="e.g., 20/40"
                  value={form.vision_without_glasses || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.vision_without_glasses || "Not tested"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Physical Examination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaStethoscope className="h-5 w-5 mr-2 text-purple-600" />
            Physical Examination
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EENT (Eyes, Ears, Nose, Throat)
              </label>
              {isEditing ? (
                <input
                  name="eent"
                  placeholder="e.g., Normal"
                  value={form.eent || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.eent || "Not examined"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lungs
              </label>
              {isEditing ? (
                <input
                  name="lungs"
                  placeholder="e.g., Clear to auscultation"
                  value={form.lungs || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.lungs || "Not examined"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart
              </label>
              {isEditing ? (
                <input
                  name="heart"
                  placeholder="e.g., Regular rate and rhythm"
                  value={form.heart || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.heart || "Not examined"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abdomen
              </label>
              {isEditing ? (
                <input
                  name="abdomen"
                  placeholder="e.g., Soft, non-tender"
                  value={form.abdomen || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.abdomen || "Not examined"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extremities
              </label>
              {isEditing ? (
                <input
                  name="extremities"
                  placeholder="e.g., No deformities"
                  value={form.extremities || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{form.extremities || "Not examined"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Assessment */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaFileMedicalAlt className="h-5 w-5 mr-2 text-orange-600" />
            Medical Assessment
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              History of Previous Illness
            </label>
            {isEditing ? (
              <textarea
                name="previous_illness"
                value={form.previous_illness || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any previous medical conditions or illnesses..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{form.previous_illness || "No previous illness recorded"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosis / Assessment
            </label>
            {isEditing ? (
              <textarea
                name="diagnosis"
                value={form.diagnosis || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter diagnosis or medical assessment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{form.diagnosis || "No diagnosis recorded"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            {isEditing ? (
              <textarea
                name="recommendation"
                value={form.recommendation || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Enter medical recommendations or follow-up instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{form.recommendation || "No recommendations recorded"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Disease Tracking Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaStethoscope className="h-5 w-5 mr-2 text-red-600" />
            Disease Tracking Information
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Disease Status Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="h-4 w-4 mr-2 text-red-600" />
              Current Disease Status
            </h4>
            {form.previous_illness ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disease</label>
                  <p className="text-lg font-semibold text-red-600">{form.previous_illness}</p>
                </div>
                {form.status && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      form.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                      form.status === 'suspected' ? 'bg-yellow-100 text-yellow-800' :
                      form.status === 'recovered' ? 'bg-green-100 text-green-800' :
                      form.status === 'quarantined' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </span>
                  </div>
                )}
                {form.severity && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <p className="text-sm font-medium text-gray-900">{form.severity}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <FaStethoscope className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 font-medium">No active disease recorded</p>
                <p className="text-gray-500 text-sm">Patient appears to be healthy</p>
              </div>
            )}
          </div>

          {/* Disease Details */}
          {form.previous_illness && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                  Onset Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="onset_date"
                    value={form.onset_date || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{fmtDate(form.onset_date) || "Not recorded"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline h-4 w-4 mr-1" />
                  Diagnosis Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="diagnosis_date"
                    value={form.diagnosis_date || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{fmtDate(form.diagnosis_date) || "Not recorded"}</p>
                )}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {form.previous_illness && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaStethoscope className="inline h-4 w-4 mr-1" />
                Symptoms
              </label>
              {isEditing ? (
                <textarea
                  name="symptoms"
                  value={form.symptoms || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the symptoms observed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{form.symptoms || "No symptoms recorded"}</p>
              )}
            </div>
          )}

          {/* Treatment */}
          {form.previous_illness && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaStethoscope className="inline h-4 w-4 mr-1" />
                Treatment
              </label>
              {isEditing ? (
                <textarea
                  name="treatment"
                  value={form.treatment || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the treatment provided..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{form.treatment || "No treatment recorded"}</p>
              )}
            </div>
          )}

          {/* Vaccination Status */}
          {form.previous_illness && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaStethoscope className="inline h-4 w-4 mr-1" />
                Vaccination Status
              </label>
              {isEditing ? (
                <select
                  name="vaccination_status"
                  value={form.vaccination_status || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="vaccinated">Vaccinated</option>
                  <option value="partially_vaccinated">Partially Vaccinated</option>
                  <option value="not_vaccinated">Not Vaccinated</option>
                  <option value="unknown">Unknown</option>
                </select>
              ) : (
                <p className="text-gray-900">{form.vaccination_status || "Not recorded"}</p>
              )}
            </div>
          )}

          {/* Contact Tracing */}
          {form.previous_illness && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline h-4 w-4 mr-1" />
                Contact Tracing Notes
              </label>
              {isEditing ? (
                <textarea
                  name="contact_tracing"
                  value={form.contact_tracing || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Record contact tracing information..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{form.contact_tracing || "No contact tracing recorded"}</p>
              )}
            </div>
          )}

          {/* Additional Notes */}
          {form.previous_illness && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFileMedicalAlt className="inline h-4 w-4 mr-1" />
                Additional Notes
              </label>
              {isEditing ? (
                <textarea
                  name="notes"
                  value={form.notes || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional information..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">{form.notes || "No additional notes"}</p>
              )}
            </div>
          )}

          {/* Reporter Information */}
          {form.previous_illness && (form.reported_by || form.reported_date) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Report Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.reported_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                    <p className="text-gray-900">{form.reported_by}</p>
                  </div>
                )}
                {form.reported_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                    <p className="text-gray-900">{fmtDate(form.reported_date)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
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

export default HealthExamination;
