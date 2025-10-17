import React, { useState } from "react";
import { FaEdit, FaTrash, FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaEllipsisV } from "react-icons/fa";
import PatientDetailsModal from "./PatientDetailsModal";
import { formatPatientID } from "../utils/patientUtils";

function PatientList({ patients, onSelect, onEdit, onDelete, loading, error }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedPatient(null);
  };

  const toggleDropdown = (patientId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === patientId ? null : patientId);
  };

  const handleActionClick = (action, patient, e) => {
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch(action) {
      case 'edit':
        onEdit(patient);
        break;
      case 'delete':
        onDelete(patient.id);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
  };

  // Add event listener for clicking outside
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 text-lg font-medium">Loading patients...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <FaIdCard className="text-6xl text-red-300 mb-4" />
          <p className="text-red-500 text-lg font-medium">Error loading patients</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <FaIdCard className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No patients found</p>
          <p className="text-gray-400 text-sm">Add a new patient to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaIdCard className="text-blue-600" />
                    Patient ID
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaIdCard className="text-blue-600" />
                    Patient Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaVenusMars className="text-blue-600" />
                    Age & Gender
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                    Address
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-600" />
                    Last Visit
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-2">
                    <FaEllipsisV className="text-blue-600" />
                    Action
                  </div>
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
                    <div className="relative dropdown-container">
                      {/* Modern Kebab Menu Button */}
                      <button
                        className="group inline-flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-sm"
                        onClick={(e) => toggleDropdown(patient.id, e)}
                        title="More actions"
                      >
                        <FaEllipsisV className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>

                      {/* Modern Dropdown Menu with Animation */}
                      {activeDropdown === patient.id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl z-[99999] border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200" style={{zIndex: 99999}}>
                          <div className="py-2">
                            {/* Edit Patient */}
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150 group/edit"
                              onClick={(e) => handleActionClick('edit', patient, e)}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 group-hover/edit:bg-emerald-200 transition-colors duration-150 mr-3">
                                <FaEdit className="h-3.5 w-3.5 text-emerald-600" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">Edit Patient</span>
                                <span className="text-xs text-gray-500">Update patient information</span>
                              </div>
                            </button>
                            
                            {/* Delete Patient - only show if onDelete function exists */}
                            {onDelete && (
                              <button
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-150 group/delete"
                                onClick={(e) => handleActionClick('delete', patient, e)}
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 group-hover/delete:bg-red-200 transition-colors duration-150 mr-3">
                                  <FaTrash className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">Delete Patient</span>
                                  <span className="text-xs text-gray-500">Remove from system</span>
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
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
