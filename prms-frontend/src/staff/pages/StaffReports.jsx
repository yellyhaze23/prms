import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFileAlt, FaDownload, FaChartBar, FaUsers, FaStethoscope, 
  FaCalendarAlt, FaFilter, FaClock, FaExclamationTriangle,
  FaUserMd, FaChartLine, FaChevronDown, FaChevronUp, FaCircle
} from 'react-icons/fa';
import api from '../../lib/api/axios';
import ModernToast from '../../components/ModernToast';

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function StaffReports() {
  const [activeTab, setActiveTab] = useState('patient-summary');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    patientSummary: null,
    medicalRecords: null,
    diseaseTracking: null,
    activityLog: null
  });
  const [filters, setFilters] = useState({
    dateRange: '30',
    disease: ''
  });
  const [diseases, setDiseases] = useState([]);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [diseaseOpen, setDiseaseOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDiseases();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDateRangeOpen(false);
        setDiseaseOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDiseases = async () => {
    try {
      const response = await api.get('/get_diseases.php');
      setDiseases(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append('days', filters.dateRange);
      if (filters.disease) params.append('disease', filters.disease);

      console.log('Fetching reports with params:', params.toString());

      // Fetch all reports in parallel
      const [patientRes, medicalRes, diseaseRes, activityRes] = await Promise.all([
        api.get(`/reports.php?${params}`),
        api.get(`/reports/medical-records.php?${params}`),
        api.get(`/reports/disease-tracking.php?${params}`),
        api.get(`/reports/activity-log.php?${params}`)
      ]);

      console.log('Report data received:', {
        patientSummary: patientRes.data,
        medicalRecords: medicalRes.data,
        diseaseTracking: diseaseRes.data,
        activityLog: activityRes.data
      });

      setData({
        patientSummary: patientRes.data?.data || patientRes.data,
        medicalRecords: medicalRes.data?.data || medicalRes.data,
        diseaseTracking: diseaseRes.data?.data || diseaseRes.data,
        activityLog: activityRes.data?.data || activityRes.data
      });
      
      // Show success toast
      setToast({
        type: 'success',
        message: 'Report generated successfully!'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      
      // Show error toast
      setToast({
        type: 'error',
        message: 'Failed to generate report. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Get data based on active tab
    let csvContent = '';
    let filename = '';

    switch (activeTab) {
      case 'patient-summary': {
        const patients = data.patientSummary?.patients || [];
        if (patients.length === 0) {
          setToast({
            type: 'warning',
            message: 'No patient data to export. Please generate a report first.'
          });
          return;
        }
        
        // CSV Header
        csvContent = 'Name,Age,Sex,Address,Last Visit Date\n';
        
        // CSV Data
        patients.forEach(patient => {
          const lastVisit = patient.last_visit_date 
            ? new Date(patient.last_visit_date).toLocaleDateString('en-US')
            : 'N/A';
          csvContent += `"${patient.full_name}",${patient.age},"${patient.sex}","${patient.address}","${lastVisit}"\n`;
        });
        
        filename = `patient-summary-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'medical-records': {
        const records = data.medicalRecords?.records || [];
        if (records.length === 0) {
          setToast({
            type: 'warning',
            message: 'No medical records to export. Please generate a report first.'
          });
          return;
        }
        
        // CSV Header
        csvContent = 'Date,Patient,Diagnosis,Barangay,Priority\n';
        
        // CSV Data
        records.forEach(record => {
          const date = new Date(record.consultation_date).toLocaleDateString('en-US');
          csvContent += `"${date}","${record.full_name}","${record.diagnosis || 'N/A'}","${record.barangay || 'N/A'}","${record.priority || 'N/A'}"\n`;
        });
        
        filename = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'disease-tracking': {
        const diseaseStats = data.diseaseTracking?.disease_stats || [];
        if (diseaseStats.length === 0) {
          setToast({
            type: 'warning',
            message: 'No disease tracking data to export. Please generate a report first.'
          });
          return;
        }
        
        // CSV Header
        csvContent = 'Disease,Total Cases,Unique Patients,Average Days Since Diagnosis\n';
        
        // CSV Data
        diseaseStats.forEach(stat => {
          const avgDays = stat.avg_days_since_diagnosis ? Math.round(stat.avg_days_since_diagnosis) : 0;
          csvContent += `"${stat.disease}",${stat.total_cases},${stat.unique_patients},${avgDays}\n`;
        });
        
        filename = `disease-tracking-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'activity-log': {
        const activities = data.activityLog?.activities || [];
        if (activities.length === 0) {
          setToast({
            type: 'warning',
            message: 'No activity log data to export. Please generate a report first.'
          });
          return;
        }
        
        // CSV Header
        csvContent = 'Date,Activity Type,Description\n';
        
        // CSV Data
        activities.forEach(activity => {
          const date = new Date(activity.activity_date).toLocaleDateString('en-US');
          csvContent += `"${date}","${activity.activity_type}","${activity.description}"\n`;
        });
        
        filename = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      default:
        setToast({
          type: 'warning',
          message: 'Please select a tab to export.'
        });
        return;
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      setToast({
        type: 'success',
        message: `Report exported successfully as ${filename}`
      });
    }
  };

  const reportTabs = [
    { id: 'patient-summary', label: 'Patient Summary', icon: FaUsers },
    { id: 'medical-records', label: 'Medical Records', icon: FaFileAlt },
    { id: 'disease-tracking', label: 'Disease Tracking', icon: FaStethoscope },
    { id: 'activity-log', label: 'Activity Log', icon: FaCalendarAlt }
  ];

  const renderPatientSummary = () => {
    const summary = data.patientSummary?.summary || {};
    const patients = data.patientSummary?.patients || [];

    return (
      <motion.div className="space-y-6" variants={cardVariants} initial="hidden" animate="visible">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_patients || 0}</p>
            </div>
          </div>
        </div>
        
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaStethoscope className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Infected Patients</p>
                <p className="text-2xl font-bold text-gray-900">{summary.infected_patients || 0}</p>
            </div>
          </div>
        </div>
        
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Healthy Patients</p>
                <p className="text-2xl font-bold text-gray-900">{summary.healthy_patients || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
        {patients.length > 0 ? (
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-blue-700">Patient Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.sex}
                    </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                      {patient.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.last_visit_date 
                        ? new Date(patient.last_visit_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="bg-white border rounded-lg p-12 text-center">
            <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No patient data available. Click "Generate Report" to fetch data.</p>
        </div>
      )}
      </motion.div>
    );
  };

  const renderMedicalRecords = () => {
    const summary = data.medicalRecords?.summary || {};
    const records = data.medicalRecords?.records || [];

    return (
      <motion.div className="space-y-6" variants={cardVariants} initial="hidden" animate="visible">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_records || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique Patients</p>
                <p className="text-2xl font-bold text-gray-900">{summary.unique_patients || 0}</p>
              </div>
            </div>
    </div>
          
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaStethoscope className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique Diagnoses</p>
                <p className="text-2xl font-bold text-gray-900">{summary.unique_diagnoses || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records Table */}
        {records.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-purple-700">Medical Records Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.consultation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.diagnosis || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.barangay || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.priority === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : record.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.priority || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
      </div>
    </div>
        ) : (
          <div className="bg-white border rounded-lg p-12 text-center">
            <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medical records available. Click "Generate Report" to fetch data.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const renderDiseaseTracking = () => {
    const summary = data.diseaseTracking?.summary || {};
    const diseaseStats = data.diseaseTracking?.disease_stats || [];

    return (
      <motion.div className="space-y-6" variants={cardVariants} initial="hidden" animate="visible">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaStethoscope className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_cases || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaChartLine className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Diseases</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_diseases || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk Cases</p>
                <p className="text-2xl font-bold text-gray-900">{summary.high_risk_cases || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disease Statistics Table */}
        {diseaseStats.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <h3 className="text-lg font-semibold text-red-700">Disease Statistics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disease</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cases</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Patients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Days Since</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {diseaseStats.map((disease, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {disease.disease}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {disease.total_cases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {disease.unique_patients}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          disease.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                          disease.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {disease.risk_level || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {disease.avg_days_since_diagnosis ? Math.round(disease.avg_days_since_diagnosis) : 'N/A'} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
      </div>
    </div>
        ) : (
          <div className="bg-white border rounded-lg p-12 text-center">
            <FaStethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No disease tracking data available. Click "Generate Report" to fetch data.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const renderActivityLog = () => {
    const summary = data.activityLog?.summary || {};
    const activities = data.activityLog?.activities || [];

    return (
      <motion.div className="space-y-6" variants={cardVariants} initial="hidden" animate="visible">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Patients Added</p>
                <p className="text-2xl font-bold text-gray-900">{summary.patients_added || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaFileAlt className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Records Created</p>
                <p className="text-2xl font-bold text-gray-900">{summary.records_created || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaUserMd className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Records Updated</p>
                <p className="text-2xl font-bold text-gray-900">{summary.records_updated || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {activities.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 className="text-lg font-semibold text-green-700">Recent Activities</h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== activities.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.activity_type === 'patient_added' ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                              {activity.activity_type === 'patient_added' ? (
                                <FaUsers className="h-4 w-4 text-white" />
                              ) : (
                                <FaFileAlt className="h-4 w-4 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{activity.description}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-400 flex items-center">
                              <FaClock className="h-3 w-3 mr-1" />
                              {new Date(activity.activity_date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
          </ul>
        </div>
      </div>
    </div>
        ) : (
          <div className="bg-white border rounded-lg p-12 text-center">
            <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activity data available. Click "Generate Report" to fetch data.</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Controls */}
      <motion.div 
        className="mb-5"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-blue-600">Staff Reports</h1>
            <p className="text-gray-700 mt-2">Generate reports for your assigned patients</p>
          </motion.div>
          
          {/* Controls on the right */}
          <motion.div 
            className="flex items-center space-x-2"
            variants={cardVariants}
          >
          <button
            onClick={exportReport}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters - Modern Clean Design */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaFilter className="h-4 w-4 text-blue-600" />
      </div>
          <h3 className="text-lg font-semibold text-blue-900">Report Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          {/* Date Range - Custom Dropdown */}
          <div className="dropdown-container">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaCalendarAlt className="text-blue-600" />
              Date Range
            </label>
            <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setDateRangeOpen(!dateRangeOpen)}
                className="w-full bg-white border-2 border-blue-400 rounded-xl pl-4 pr-10 py-2.5 text-left text-gray-800 font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                {filters.dateRange === '7' && 'Last 7 days'}
                {filters.dateRange === '30' && 'Last 30 days'}
                {filters.dateRange === '90' && 'Last 90 days'}
                {filters.dateRange === '180' && 'Last 6 months'}
                {filters.dateRange === '365' && 'Last year'}
                {filters.dateRange === 'all' && 'All time'}
              </button>
              {dateRangeOpen ? (
                <FaChevronUp className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              ) : (
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              )}
              
              {dateRangeOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-400 rounded-xl shadow-lg overflow-hidden">
                  {[
                    { value: '7', label: 'Last 7 days' },
                    { value: '30', label: 'Last 30 days' },
                    { value: '90', label: 'Last 90 days' },
                    { value: '180', label: 'Last 6 months' },
                    { value: '365', label: 'Last year' },
                    { value: 'all', label: 'All time' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilters({...filters, dateRange: option.value});
                        setDateRangeOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                        filters.dateRange === option.value
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                      {filters.dateRange === option.value && (
                        <FaCircle className="text-blue-600 text-xs" />
                      )}
                    </button>
                  ))}
                </div>
              )}
          </div>
          </div>

          {/* Disease - Custom Dropdown */}
          <div className="dropdown-container">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaStethoscope className="text-blue-600" />
              Disease
            </label>
            <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setDiseaseOpen(!diseaseOpen)}
                className="w-full bg-white border-2 border-blue-400 rounded-xl pl-4 pr-10 py-2.5 text-left text-gray-800 font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                {filters.disease || 'All Diseases'}
              </button>
              {diseaseOpen ? (
                <FaChevronUp className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              ) : (
                <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              )}
              
              {diseaseOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-blue-400 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({...filters, disease: ''});
                      setDiseaseOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                      !filters.disease
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Diseases
                    {!filters.disease && (
                      <FaCircle className="text-blue-600 text-xs" />
                    )}
                  </button>
              {diseases.map((disease) => (
                    <button
                      key={disease.id}
                      type="button"
                      onClick={() => {
                        setFilters({...filters, disease: disease.name});
                        setDiseaseOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                        filters.disease === disease.name
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {disease.name}
                      {filters.disease === disease.name && (
                        <FaCircle className="text-blue-600 text-xs" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Report Button */}
          <div>
          <button
            onClick={generateReport}
            disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
          >
            <FaChartBar className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
      </motion.div>

      {/* Report Tabs */}
      <div className="bg-white border rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'patient-summary' && renderPatientSummary()}
          {activeTab === 'medical-records' && renderMedicalRecords()}
          {activeTab === 'disease-tracking' && renderDiseaseTracking()}
          {activeTab === 'activity-log' && renderActivityLog()}
        </div>
      </div>

      {/* Modern Toast Notification */}
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
    </div>
  );
}

