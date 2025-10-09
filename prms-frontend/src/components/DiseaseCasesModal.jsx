import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaDownload, FaUser, FaCalendarAlt, FaStethoscope, FaEye } from 'react-icons/fa';
import axios from 'axios';
import Toast from './Toast';
import { formatPatientID } from '../utils/patientUtils';

const DiseaseCasesModal = ({ disease, onClose }) => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (disease) {
      fetchDiseaseCases();
    }
  }, [disease]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    // Filter cases based on search term
    if (searchTerm) {
      const filtered = cases.filter(case_ => 
        case_.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPatientID(case_.patient_id).includes(searchTerm) ||
        (case_.address && case_.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCases(filtered);
    } else {
      setFilteredCases(cases);
    }
  }, [searchTerm, cases]);

  const fetchDiseaseCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost/prms/prms-backend/get_disease_cases.php?disease=${encodeURIComponent(disease)}`);
      
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
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative mx-auto border w-full max-w-6xl shadow-xl rounded-lg bg-white max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <FaStethoscope className="mr-3" />
                {disease} Cases
              </h2>
              <p className="text-blue-100 mt-1">
                {cases.length} total case{cases.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-blue-600 rounded-full"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by patient name, ID, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FaDownload className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Cases List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <FaStethoscope className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No cases found matching your search' : 'No cases found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : `No patients have been diagnosed with ${disease}`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Onset Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symptoms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Treatment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCases.map((case_, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaCalendarAlt className="h-4 w-4 mr-2 text-green-600" />
                          {formatDate(case_.onset_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {case_.symptoms ? (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              {case_.symptoms.length > 50 ? `${case_.symptoms.substring(0, 50)}...` : case_.symptoms}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Not recorded</span>
                          )}
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

        {/* Footer removed - using X button in header and click-outside-to-close */}
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
