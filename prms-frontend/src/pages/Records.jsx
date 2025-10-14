import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toolbar from '../components/Toolbar';
import Return from '../components/Return';
import AddPatient from '../components/AddPatient';
import Toast from '../components/Toast';
import MedicalRecords from '../components/MedicalRecords';
import ConfirmationModal from '../components/ConfirmationModal';
import Pagination from '../components/Pagination';
import { FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash, FaStethoscope, FaFilter } from 'react-icons/fa';
import { formatPatientID } from '../utils/patientUtils';

function Records() {
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc"); 
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
    fetchDiseases();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm, selectedDisease]);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchTerm,
        disease: selectedDisease
      });

      const response = await axios.get(`http://localhost/prms/prms-backend/get_all_medical_records.php?${params}`);
      
      if (response.data.success) {
        setPatients(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
      } else {
        console.error("Failed to fetch medical records");
      }
    } catch (err) {
      console.error("Error fetching medical records:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      const response = await axios.get("http://localhost/prms/prms-backend/get_diseases.php");
      setDiseases(response.data);
    } catch (err) {
      console.error("Error fetching diseases:", err);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePageChange = (page, newItemsPerPage) => {
    setCurrentPage(page);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleDiseaseFilter = (disease) => {
    setSelectedDisease(disease);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleEditBasicInfo = (patient) => {
    setEditPatient(patient);
    setShowAddModal(true);
  };

  const handleDeletePatient = (patientId) => {
    setConfirmModal({
      message: "Are you sure you want to delete this patient? This action cannot be undone.",
      onConfirm: () => {
        axios.delete(`http://localhost/prms/prms-backend/delete_patient.php`, {
          data: { id: patientId }
        })
        .then(() => {
          setPatients(patients.filter(p => p.id !== patientId));
          if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient(null);
          }
          showToast("Patient deleted successfully", "success");
          setConfirmModal(null);
        })
        .catch((err) => {
          console.error("Error deleting patient:", err);
          showToast("Error deleting patient", "error");
          setConfirmModal(null);
        });
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleAddPatient = (newPatient) => {
    setPatients([...patients, newPatient]);
    showToast("Patient added successfully", "success");
  };

  const handleUpdatePatient = (updatedPatient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient && selectedPatient.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
    showToast("Patient updated successfully", "success");
  };

  // Server-side filtering and pagination, no client-side filtering needed

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedPatient ? (
          <>
            {/* Header */}
            <div className="mb-8 bg-blue-600 p-4 rounded-lg">
              <h1 className="text-3xl font-bold text-white">Medical Records</h1>
              <p className="mt-2 text-blue-100">View and manage patient medical records</p>
            </div>

                {/* Toolbar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search patients by name, contact, address, or disease..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>

                    {/* Disease Filter */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FaStethoscope className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filter by Disease:</span>
                      </div>
                      <select
                        className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedDisease}
                        onChange={(e) => handleDiseaseFilter(e.target.value)}
                      >
                        <option value="all">All Patients</option>
                        <option value="healthy">Healthy Patients</option>
                        {diseases.map((disease) => (
                          <option key={disease.id} value={disease.name}>
                            {disease.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleSort(sortBy)}
                          title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
                        >
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <FaIdCard className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No medical records found</p>
                  <p className="text-gray-400 text-sm">Patient records will appear here</p>
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
                            <FaStethoscope className="text-gray-400" />
                            Diagnosis
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
                          onClick={() => setSelectedPatient(patient)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
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
                            <div>
                              <div className="font-medium">{patient.age ? `${patient.age} years old` : 'N/A'}</div>
                              <div className="text-gray-500">{patient.sex || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={patient.address}>
                              {patient.address || 'No address provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.diagnosis ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <FaStethoscope className="h-3 w-3 text-red-500" />
                                  <span className="font-medium text-red-600">{patient.diagnosis}</span>
                                </div>
                                {patient.status && (
                                  <div className="text-xs text-gray-500">
                                    Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      patient.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                                      patient.status === 'suspected' ? 'bg-yellow-100 text-yellow-800' :
                                      patient.status === 'recovered' ? 'bg-green-100 text-green-800' :
                                      patient.status === 'quarantined' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                                    </span>
                                  </div>
                                )}
                                {patient.severity && (
                                  <div className="text-xs text-gray-500">
                                    Severity: <span className="font-medium">{patient.severity}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-600">
                                <FaStethoscope className="h-3 w-3" />
                                <span className="text-sm">Healthy</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 
                             patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                                title="Edit Medical Records"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                title="Delete Patient"
                                onClick={() => handleDeletePatient(patient.id)}
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalRecords}
                showPageSizeSelector={true}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            )}
          </>
        ) : (
          <>
            <Return onBack={() => setSelectedPatient(null)} />
            <MedicalRecords 
              patient={selectedPatient} 
              onEdit={handleEditBasicInfo}
              onDelete={handleDeletePatient}
              onPatientUpdate={handleUpdatePatient}
            />
          </>
        )}
      </div>

      {/* Modals and Toast */}
      {showAddModal && (
        <AddPatient
          patient={editPatient}
          onClose={() => {
            setShowAddModal(false);
            setEditPatient(null);
          }}
          onConfirm={editPatient ? handleUpdatePatient : handleAddPatient}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Records;
