import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api/axios';
import StaffMedicalRecords from '../components/StaffMedicalRecords';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import SortControl from '../../components/SortControl';
import FilterControl from '../../components/FilterControl';
import { FaSearch, FaUser, FaFileMedicalAlt, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaStethoscope, FaSort, FaEye, FaAddressCard, FaEllipsisV, FaEdit, FaDownload } from 'react-icons/fa';
import ModernToast from '../../components/ModernToast';
import { formatPatientID } from '../../utils/patientUtils';
import { downloadMedicalRecord } from '../../utils/documentGenerator';
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../../utils/animations';

export default function StaffRecords() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Sort options for SortControl
  const sortOptions = [
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'created_at', label: 'Date Added' },
    { value: 'full_name', label: 'Name' },
    { value: 'diagnosis', label: 'Diagnosis' }
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchPatients();
    fetchDiseases();
  }, [currentPage, itemsPerPage, searchTerm, diseaseFilter, sortBy, sortOrder]);

  const fetchDiseases = async () => {
    try {
      const response = await api.get('/get_diseases.php');
      setDiseases(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        q: searchTerm,
        disease: diseaseFilter === 'all' ? '' : diseaseFilter,
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      const response = await api.get(`/patients.php?${params}`);
      if (response.data.success) {
        setPatients(response.data.data || []);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
      } else {
        showToast('Error fetching patients', 'error');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      showToast('Error fetching patients', 'error');
    } finally {
      setLoading(false);
    }
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

  const handleDiseaseFilter = (disease) => {
    setDiseaseFilter(disease);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (field) => {
    setSortBy(field);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const toggleMenu = (patientId, event) => {
    event.stopPropagation(); // Prevent row click when clicking menu
    setOpenMenuId(openMenuId === patientId ? null : patientId);
  };

  const handleEditRecords = (patient, event) => {
    event.stopPropagation(); // Prevent row click
    setOpenMenuId(null);
    handlePatientSelect(patient);
  };

  const handleDownloadRecord = async (patient, event) => {
    event.stopPropagation(); // Prevent row click
    setOpenMenuId(null);
    
    try {
      // Fetch the complete medical record data
      showToast('Preparing download...', 'info');
      const response = await api.get(`/medical-records/get.php?patient_id=${patient.id}`);
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

  if (selectedPatient) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div>
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            ← Back to Patients
          </button>
        </div>

        {/* Medical Records Component */}
        <StaffMedicalRecords 
          patient={selectedPatient}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modern Header - Enhanced like Admin Portal */}
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
          
          {/* Controls on the right */}
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
                value={diseaseFilter}
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

      {/* Patients Table */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaIdCard className="h-4 w-4" />
                    PATIENT ID
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaUser className="h-4 w-4" />
                    PATIENT NAME
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="h-4 w-4" />
                    AGE & GENDER
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="h-4 w-4" />
                    ADDRESS
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaStethoscope className="h-4 w-4" />
                    DIAGNOSIS
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="h-4 w-4" />
                    LAST VISIT
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-500">Loading patients...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    onClick={() => handlePatientSelect(patient)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{formatPatientID(patient.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{patient.age} years old</div>
                        <div className="text-gray-500">{patient.sex}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {patient.diagnosis ? (
                        <div className="flex items-center">
                          <FaStethoscope className="h-3 w-3 text-red-500 mr-1" />
                          <span className="text-red-600 font-medium">{patient.diagnosis}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No diagnosis</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative" ref={openMenuId === patient.id ? menuRef : null}>
                        <button
                          onClick={(e) => toggleMenu(patient.id, e)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-150"
                          aria-label="Actions menu"
                        >
                          <FaEllipsisV className="h-4 w-4 text-gray-600" />
                        </button>
                        
                        {openMenuId === patient.id && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden">
                            <div className="py-2">
                              <button
                                onClick={(e) => handleEditRecords(patient, e)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start transition-colors duration-150"
                              >
                                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                  <FaEdit className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900">Edit Records</div>
                                  <div className="text-xs text-gray-500 mt-0.5">Update medical records</div>
                                </div>
                              </button>
                              
                              <button
                                onClick={(e) => handleDownloadRecord(patient, e)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start transition-colors duration-150"
                              >
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <FaDownload className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900">Download Record</div>
                                  <div className="text-xs text-gray-500 mt-0.5">Export as DOCX file</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-center">
                      <FaUser className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No patients found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || diseaseFilter !== 'All Patients' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'No patients assigned to you yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalRecords}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </motion.div>
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

