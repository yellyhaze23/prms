import React, { useState } from "react";
import { FaEdit, FaTrash, FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars } from "react-icons/fa";
import PatientDetailsModal from "./PatientDetailsModal";
import { formatPatientID } from "../utils/patientUtils";

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
          <FaIdCard className="text-6xl text-gray-300 mb-4" />
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
                    Patient ID
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaIdCard className="text-gray-400" />
                    Patient Name
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Age & Gender
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    Address
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Last Visit
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
                  onClick={() => handleViewDetails(patient)}
                  className="hover:bg-blue-50 hover:shadow-sm cursor-pointer transition-all duration-200 group"
                  title="Click to view patient details"
                >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{formatPatientID(patient.id)}
                        </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">
                       {patient.full_name}
                     </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                        <span>{patient.age ? `${patient.age} years old` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaVenusMars className="h-3 w-3 text-gray-400" />
                        <span className="capitalize">{patient.sex || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={patient.address}>
                      {patient.address || 'No address provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="h-3 w-3 text-gray-400" />
                      <span>
                        {patient.last_visit_date 
                          ? new Date(patient.last_visit_date).toLocaleDateString('en-US', {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'No visits'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                        title="Edit Medical Records"
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
