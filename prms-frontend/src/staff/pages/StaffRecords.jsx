import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StaffMedicalRecords from '../components/StaffMedicalRecords';
import { FaSearch, FaUser, FaFileMedicalAlt, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaStethoscope, FaSort, FaEye, FaAddressCard } from 'react-icons/fa';
import Toast from '../../components/Toast';
import { formatPatientID } from '../../utils/patientUtils';

export default function StaffRecords() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('All Patients');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost/prms/prms-backend/api/staff/patients.php');
      if (response.data.success) {
        setPatients(response.data.data || []);
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

  const filteredPatients = patients.filter(patient => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (patient.full_name || '').toLowerCase().includes(term) ||
      (patient.id || '').toString().includes(term) ||
      (patient.address || '').toLowerCase().includes(term)
    );
    
    const matchesDisease = diseaseFilter === 'All Patients' || 
      (patient.diagnosis && patient.diagnosis.toLowerCase().includes(diseaseFilter.toLowerCase()));
    
    return matchesSearch && matchesDisease;
  });

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

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <FaAddressCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients by name, contact, address, or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <FaStethoscope className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Disease:</span>
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Patients">All Patients</option>
              <option value="chickenpox">Chickenpox</option>
              <option value="dengue">Dengue</option>
              <option value="hepatitis">Hepatitis</option>
              <option value="measles">Measles</option>
              <option value="tuberculosis">Tuberculosis</option>
            </select>
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <FaSort className="h-4 w-4 text-gray-600" />
            </button>
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
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
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
