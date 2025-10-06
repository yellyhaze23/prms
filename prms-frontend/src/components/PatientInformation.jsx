import React from "react";
import { FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaHospital, FaEdit, FaTrash } from "react-icons/fa";

function PatientInformation({ patient, onEdit, onDelete }) {
  if (!patient) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No patient selected</p>
      </div>
    </div>
  );

  const imageSrc = patient.image_path
    ? `http://localhost/prms/prms-backend/uploads/${patient.image_path}`
    : "/lspu-logo.png";

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <img
                  src={imageSrc}
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
                title="Edit Patient"
              >
                <FaEdit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(patient.id)}
                className="inline-flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors duration-200"
                title="Delete Patient"
              >
                <FaTrash className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUser className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaUser className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{patient.full_name || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{patient.age ? `${patient.age} years old` : "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaVenusMars className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">{patient.sex || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaPhone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium text-gray-900">{patient.contact_number || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{patient.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{patient.address || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaPhone className="h-5 w-5 mr-2 text-red-600" />
            Emergency Contact
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <FaUser className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{patient.emergency_name || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaUser className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Relationship</p>
                <p className="font-medium text-gray-900">{patient.emergency_relation || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaPhone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium text-gray-900">{patient.emergency_contact || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Card (Optional) */}
      {(patient.patient_id || patient.course_year_section || patient.department) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaIdCard className="h-5 w-5 mr-2 text-green-600" />
              Additional Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {patient.patient_id && (
                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="font-medium text-gray-900">{patient.patient_id}</p>
                  </div>
                </div>
              )}
              {patient.course_year_section && (
                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900">{patient.course_year_section}</p>
                  </div>
                </div>
              )}
              {patient.department && (
                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{patient.department}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientInformation;
