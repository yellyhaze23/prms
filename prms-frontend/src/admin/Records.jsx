import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Toolbar from '../components/Toolbar';
import Return from '../components/Return';
import AddPatient from '../components/AddPatient';
import ModernToast from '../components/ModernToast';
import MedicalRecords from '../components/MedicalRecords';
import ConfirmationModal from '../components/ConfirmationModal';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import SortControl from '../components/SortControl';
import FilterControl from '../components/FilterControl';
import { FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash, FaStethoscope, FaFilter, FaEllipsisV, FaDownload } from 'react-icons/fa';
import { formatPatientID } from '../utils/patientUtils';
import { downloadMedicalRecord } from '../utils/documentGenerator';
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  listItemVariants,
  buttonVariants,
  hoverScale 
} from '../utils/animations';

function Records() {
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc"); 
  const [selectedDisease, setSelectedDisease] = useState("all");

  // Sort options for SortControl
  const sortOptions = [
    { value: "updated_at", label: "Last Updated" },
    { value: "created_at", label: "Date Added" },
    { value: "full_name", label: "Name" },
    { value: "diagnosis", label: "Diagnosis" }
  ];

  // Filter options for FilterControl - created after diseases are loaded
  const filterOptions = React.useMemo(() => [
    { value: "all", label: "All Patients" },
    ...diseases
      .filter(disease => disease.name !== "Test Disease") // Remove Test Disease
      .map(disease => ({
        value: disease.name,
        label: disease.name
      }))
  ], [diseases]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
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
    console.log('useEffect triggered with selectedDisease:', selectedDisease);
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

      console.log('API call with params:', {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchTerm,
        disease: selectedDisease
      });

      const response = await axios.get(`http://localhost/prms/prms-backend/get_patients.php?${params}`);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setPatients(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
        console.log('Successfully loaded patients:', response.data.data.length);
      } else {
        console.error("Failed to fetch medical records:", response.data);
      }
    } catch (err) {
      console.error("Error fetching medical records:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
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
    setSortBy(field);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  const handleDiseaseFilter = (disease) => {
    console.log('Filter changed to:', disease);
    console.log('Current selectedDisease before update:', selectedDisease);
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

  const toggleDropdown = (patientId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === patientId ? null : patientId);
  };

  const handleActionClick = (action, patient, e) => {
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch(action) {
      case 'edit':
        setSelectedPatient(patient);
        break;
      case 'delete':
        handleDeletePatient(patient.id);
        break;
      default:
        break;
    }
  };

  const handleDownloadRecord = async (patient, e) => {
    e.stopPropagation();
    setActiveDropdown(null);
    
    try {
      // Show loading toast
      showToast('Preparing download...', 'info');
      
      // Fetch the complete medical record data
      const response = await axios.get(`http://localhost/prms/prms-backend/get_medical_records.php?patient_id=${patient.id}`);
      const medicalRecord = response.data;
      
      // Download the record
      const success = await downloadMedicalRecord(medicalRecord);
      
      if (success) {
        showToast(`Medical record for ${patient.full_name} downloaded successfully!`, 'success');
      } else {
        showToast('Error generating download file', 'error');
      }
    } catch (error) {
      console.error('Error downloading medical record:', error);
      showToast('Error downloading medical record', 'error');
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

  // Server-side filtering and pagination, no client-side filtering needed

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedPatient ? (
          <>
            {/* Modern Header with Controls */}
            <motion.div 
              className="mb-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div variants={cardVariants}>
                  <h1 className="text-3xl font-bold text-blue-600">Medical Records</h1>
                  <p className="text-gray-700 mt-2">View and manage patient medical records</p>
                </motion.div>
                
                {/* Modern Controls */}
                <motion.div 
                  className="flex items-center space-x-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Modern Search Input */}
                  <motion.div variants={cardVariants}>
                    <SearchInput
                      placeholder="Search patients by name, contact, address, or disease..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-80"
                    />
                  </motion.div>

                  {/* Modern Filter Control */}
                  <motion.div variants={cardVariants}>
                    <FilterControl
                      label="Filter"
                      value={selectedDisease}
                      options={filterOptions}
                      onChange={handleDiseaseFilter}
                    />
                  </motion.div>

                  {/* Modern Sort Control */}
                  <motion.div variants={cardVariants}>
                    <SortControl
                      value={sortBy}
                      order={sortOrder}
                      options={sortOptions}
                      onChange={handleSort}
                      onToggleOrder={handleSortOrderToggle}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Records Table */}
            <motion.div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              {patients.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 px-6"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <FaIdCard className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No medical records found</p>
                  <p className="text-gray-400 text-sm">Patient records will appear here</p>
                </motion.div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100 p-0">
                  <table className="w-full h-full divide-y divide-gray-200 border-collapse">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 w-full">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="text-blue-600" />
                            Patient ID
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="text-blue-600" />
                            Patient Name
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" />
                            Age & Gender
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-600" />
                            Address
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center gap-2">
                            <FaStethoscope className="text-blue-600" />
                            Diagnosis
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" />
                            Last Visit
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider w-1/7">
                          <div className="flex items-center justify-end gap-2">
                            <FaEllipsisV className="text-blue-600" />
                            Action
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 w-full">
                      {patients.map((patient, index) => (
                        <tr
                          key={patient.id || index}
                          onClick={() => setSelectedPatient(patient)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-200 w-full"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/7">
                            #{formatPatientID(patient.id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-1/7">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.full_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/7">
                            <div>
                              <div className="font-medium">{patient.age ? `${patient.age} years old` : 'N/A'}</div>
                              <div className="text-gray-500">{patient.sex || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 w-1/7">
                            <div className="max-w-xs truncate" title={patient.address}>
                              {patient.address || 'No address provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/7">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/7">
                            {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 
                             patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/7" onClick={(e) => e.stopPropagation()}>
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
                                    {/* Edit Medical Records */}
                                    <button
                                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150 group/edit"
                                      onClick={(e) => handleActionClick('edit', patient, e)}
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 group-hover/edit:bg-emerald-200 transition-colors duration-150 mr-3">
                                        <FaEdit className="h-3.5 w-3.5 text-emerald-600" />
                                      </div>
                                      <div className="flex flex-col items-start">
                                        <span className="font-medium">Edit Records</span>
                                        <span className="text-xs text-gray-500">Update medical records</span>
                                      </div>
                                    </button>
                                    
                                    {/* Download Medical Record */}
                                    <button
                                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 group/download"
                                      onClick={(e) => handleDownloadRecord(patient, e)}
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 group-hover/download:bg-blue-200 transition-colors duration-150 mr-3">
                                        <FaDownload className="h-3.5 w-3.5 text-blue-600" />
                                      </div>
                                      <div className="flex flex-col items-start">
                                        <span className="font-medium">Download Record</span>
                                        <span className="text-xs text-gray-500">Export as DOCX file</span>
                                      </div>
                                    </button>
                                    
                                    {/* Delete Patient */}
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
            </motion.div>

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
        <ModernToast
          isVisible={true}
          title={toast.type === 'success' ? 'Success!' : toast.type === 'error' ? 'Error' : 'Notice'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </motion.div>
  );
}

export default Records;
