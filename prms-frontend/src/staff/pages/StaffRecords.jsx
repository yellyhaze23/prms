import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StaffMedicalRecords from '../components/StaffMedicalRecords';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import SortControl from '../../components/SortControl';
import FilterControl from '../../components/FilterControl';
import { FaSearch, FaUser, FaFileMedicalAlt, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaStethoscope, FaSort, FaEye, FaAddressCard } from 'react-icons/fa';
import Toast from '../../components/Toast';
import { formatPatientID } from '../../utils/patientUtils';

export default function StaffRecords() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

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
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    fetchPatients();
    fetchDiseases();
  }, [currentPage, itemsPerPage, searchTerm, diseaseFilter]);

  const fetchDiseases = async () => {
    try {
      const response = await axios.get('http://localhost/prms/prms-backend/get_diseases.php');
      setDiseases(response.data);
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
        disease: diseaseFilter === 'all' ? '' : diseaseFilter
      });

      const response = await axios.get(`http://localhost/prms/prms-backend/api/staff/patients.php?${params}`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Medical Records</h1>
            <p className="text-blue-100 mt-1">View and manage patient medical records</p>
          </div>
          <FaFileMedicalAlt className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Modern Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search patients by name, contact, address, or disease..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <FilterControl
              label="Filter by Disease"
              value={diseaseFilter}
              options={filterOptions}
              onChange={handleDiseaseFilter}
            />
            <SortControl
              value={sortBy}
              order={sortOrder}
              options={sortOptions}
              onChange={handleSort}
              onToggleOrder={handleSortOrderToggle}
            />
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaIdCard className="h-4 w-4 mr-2" />
                    PATIENT ID
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaUser className="h-4 w-4 mr-2" />
                    PATIENT NAME
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-4 w-4 mr-2" />
                    AGE & GENDER
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                    ADDRESS
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaStethoscope className="h-4 w-4 mr-2" />
                    DIAGNOSIS
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-4 w-4 mr-2" />
                    LAST VISIT
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <tr key={patient.id} className="hover:bg-gray-50">
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
                      {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePatientSelect(patient)}
                          className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors duration-200"
                        >
                        <FaEye className="h-3 w-3 mr-1" />
                        View Records
                      </button>
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

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
}
