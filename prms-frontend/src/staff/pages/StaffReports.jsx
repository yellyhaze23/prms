import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaDownload, FaChartBar, FaUsers, FaStethoscope, FaCalendarAlt, FaFilter, FaPrint } from 'react-icons/fa';
import api from '../../lib/api/axios';

export default function StaffReports() {
  const [activeTab, setActiveTab] = useState('patient-summary');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    disease: '',
    status: ''
  });
  const [diseases, setDiseases] = useState([]);

  useEffect(() => {
    fetchDiseases();
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
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.disease) params.append('disease', filters.disease);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/reports.php?${params}`);
      setData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    // In a real implementation, this would generate and download the report
    console.log(`Exporting report in ${format} format`);
    // For now, just show an alert
    alert(`Report export in ${format} format would be implemented here`);
  };

  const printReport = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'patient-summary', label: 'Patient Summary', icon: FaUsers },
    { id: 'medical-records', label: 'Medical Records', icon: FaFileAlt },
    { id: 'disease-tracking', label: 'Disease Tracking', icon: FaStethoscope },
    { id: 'activity-log', label: 'Activity Log', icon: FaCalendarAlt }
  ];

  const renderPatientSummary = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{data?.summary?.total_patients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaStethoscope className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Infected Patients</p>
              <p className="text-2xl font-bold text-gray-900">{data?.summary?.infected_patients || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Healthy Patients</p>
              <p className="text-2xl font-bold text-gray-900">{data?.summary?.healthy_patients || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      {data?.patients && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Patient Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.patients.map((patient, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.sex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'healthy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {patient.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Records Report</h3>
        <p className="text-gray-600">This report would show detailed medical records for your assigned patients within the selected date range.</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Report would include:</p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Consultation dates and times</li>
            <li>Diagnoses and treatments</li>
            <li>Prescribed medications</li>
            <li>Medical advice and follow-up recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDiseaseTracking = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Disease Tracking Report</h3>
        <p className="text-gray-600">Track disease progression and patterns among your assigned patients.</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Report would include:</p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Disease occurrence by date</li>
            <li>Patient recovery progress</li>
            <li>Treatment effectiveness</li>
            <li>Risk assessment updates</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderActivityLog = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Log Report</h3>
        <p className="text-gray-600">View your activity history and patient interactions within the selected period.</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Report would include:</p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Patient consultations logged</li>
            <li>Medical records updated</li>
            <li>Follow-up appointments scheduled</li>
            <li>Treatment plan modifications</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Reports</h1>
          <p className="text-slate-600 mt-1">Generate reports for your assigned patients</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={printReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaPrint className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            onClick={() => exportReport('PDF')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaDownload className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({...filters, from: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({...filters, to: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disease</label>
            <select
              value={filters.disease}
              onChange={(e) => setFilters({...filters, disease: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Diseases</option>
              {diseases.map((disease) => (
                <option key={disease.id} value={disease.name}>{disease.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="infected">Infected</option>
              <option value="recovering">Recovering</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FaChartBar className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white border rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
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
    </div>
  );
}
