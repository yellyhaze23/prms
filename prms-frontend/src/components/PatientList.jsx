import React, { useState } from "react";
import { FaEdit, FaTrash, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaEye } from "react-icons/fa";
import PatientDetailsModal from "./PatientDetailsModal";

function PatientList({ patients, onSelect, onEdit, onDelete }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <FaUser className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No patients found</p>
          <p className="text-gray-400 text-sm">Add a new patient to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaIdCard className="text-gray-400" />
                    ID
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    Patient Name
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Age
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    Contact
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    Address
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient, index) => (
                <tr
                  key={patient.id || index}
                  onClick={() => onSelect && onSelect(patient)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{patient.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.sex}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.age ? `${patient.age} years old` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {patient.contact_number && (
                        <div className="flex items-center gap-1">
                          <FaPhone className="h-3 w-3 text-gray-400" />
                          <span>{patient.contact_number}</span>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-1">
                          <FaEnvelope className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-32">{patient.email}</span>
                        </div>
                      )}
                      {!patient.contact_number && !patient.email && (
                        <span className="text-gray-400">No contact info</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={patient.address}>
                      {patient.address || 'No address provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                        title="View Details"
                        onClick={() => handleViewDetails(patient)}
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                        title="Edit Patient"
                        onClick={() => onEdit(patient)}
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                        title="Delete Patient"
                        onClick={() => onDelete(patient.id)}
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isVisible={showDetailsModal}
        onClose={handleCloseModal}
        patient={selectedPatient}
      />
    </div>
  );
}

export default PatientList;
