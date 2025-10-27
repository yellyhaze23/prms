import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaDownload, FaUser, FaCalendarAlt, FaStethoscope, FaEye } from 'react-icons/fa';
import axios from 'axios';
import Toast from './Toast';
import Pagination from './Pagination';
import SearchInput from './SearchInput';
import { formatPatientID } from '../utils/patientUtils';

const DiseaseCasesModal = ({ disease, onClose }) => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    if (disease) {
      fetchDiseaseCases();
    }
  }, [disease]);

  // Animation effect for smooth modal opening - optimized for performance
  useEffect(() => {
    // Use requestAnimationFrame for better performance
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Handle click outside and keyboard escape to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Calculate pagination
  const calculatePagination = (data) => {
    const total = data.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    setTotalPages(totalPages);
    
    // Reset to page 1 if current page is beyond total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  };

  // Get current page data - optimized with useMemo
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCases.slice(startIndex, endIndex);
  }, [filteredCases, currentPage, itemsPerPage]);

  // Optimize filtering with useMemo
  const filteredCasesMemo = useMemo(() => {
    if (searchTerm) {
      return cases.filter(case_ => 
        case_.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPatientID(case_.patient_id).includes(searchTerm) ||
        (case_.address && case_.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return cases;
  }, [searchTerm, cases]);

  useEffect(() => {
    setFilteredCases(filteredCasesMemo);
  }, [filteredCasesMemo]);

  // Update pagination when filtered cases change
  useEffect(() => {
    calculatePagination(filteredCases);
  }, [filteredCases, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const fetchDiseaseCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost/prms-backend/get_disease_cases.php?disease=${encodeURIComponent(disease)}`);
      
      if (response.data.success) {
        setCases(response.data.cases);
        setFilteredCases(response.data.cases);
      } else {
        showToast('Failed to fetch disease cases', 'error');
      }
    } catch (error) {
      console.error('Error fetching disease cases:', error);
      showToast('Error loading disease cases', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Removed unused status and severity functions since they're not part of current workflow

  const formatDate = (date) => {
    if (!date) return 'Not recorded';
    return new Date(date).toLocaleDateString();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Patient ID', 'Patient Name', 'Age', 'Sex', 'Diagnosis Date', 'Symptoms', 'Treatment', 'Medical Advice'];
    const csvContent = [
      headers.join(','),
      ...filteredCases.map(case_ => [
        formatPatientID(case_.patient_id),
        `"${case_.patient_name}"`,
        case_.age,
        case_.sex,
        formatDate(case_.diagnosis_date),
        `"${case_.symptoms || 'Not recorded'}"`,
        `"${case_.treatment || 'Not recorded'}"`,
        `"${case_.medical_advice || 'Not recorded'}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${disease}_cases_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Cases exported successfully', 'success');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading cases...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`relative mx-auto border-0 w-full max-w-7xl shadow-2xl rounded-2xl bg-white max-h-[95vh] overflow-hidden flex flex-col transform transition-all duration-200 ease-out ${
        isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-98 opacity-0 translate-y-2'
      }`}>
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FaStethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold flex items-center">
                  {disease} Cases
                </h2>
                <p className="text-blue-100 mt-2 text-lg">
                  {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} found
                  {searchTerm && ` (filtered from ${cases.length} total)`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-blue-200 transition-all duration-200 p-3 hover:bg-white/20 rounded-xl transform hover:scale-105"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modern Search and Actions */}
        <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <SearchInput
                placeholder="Search by patient name, ID, or address..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full"
              />
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <FaDownload className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Cases List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredCases.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FaStethoscope className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm ? 'No cases found matching your search' : 'No cases found'}
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms or clear the search to see all cases' : `No patients have been diagnosed with ${disease} yet`}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Diagnosis Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Treatment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentPageData.map((case_, index) => (
                    <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border-b border-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-sm">
                            <FaUser className="text-white h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {case_.patient_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{formatPatientID(case_.patient_id)} • {case_.age}y • {case_.sex}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaCalendarAlt className="h-4 w-4 mr-2 text-blue-600" />
                          {formatDate(case_.diagnosis_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {case_.treatment ? (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {case_.treatment.length > 50 ? `${case_.treatment.substring(0, 50)}...` : case_.treatment}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Not recorded</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {case_.address || <span className="text-gray-400 italic">Not provided</span>}
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
        {filteredCases.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCases.length}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DiseaseCasesModal;

