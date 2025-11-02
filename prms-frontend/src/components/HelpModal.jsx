import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUsers, 
  FaFileAlt, 
  FaChartBar, 
  FaCog, 
  FaShieldAlt, 
  FaQuestionCircle 
} from 'react-icons/fa';

const HelpModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('quick-start');

  const helpSections = {
    'quick-start': {
      title: 'Quick Start Guide',
      icon: <FaQuestionCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Welcome to TRACELY!</h4>
            <p className="text-blue-700">This guide will help you get started with the Tracely Patient Record System with tracking and forecasting.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">First Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Log in with your credentials</li>
              <li>Familiarize yourself with the dashboard</li>
              <li>Add your first patient record</li>
              <li>Create a medical record entry</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Navigation Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use the sidebar to navigate between sections</li>
              <li>Search functionality is available in most pages</li>
              <li>Click on patient names to view detailed information</li>
              <li>Use filters to find specific records quickly</li>
            </ul>
          </div>
        </div>
      )
    },
    'patient-management': {
      title: 'Patient Management',
      icon: <FaUsers className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Adding New Patients:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <strong>Patients</strong> page</li>
              <li>Click <strong>"Add New Patient"</strong> button</li>
              <li>Fill in required information (Name, Date of Birth, Gender, Address)</li>
              <li>Add optional medical information</li>
              <li>Click <strong>"Save Patient"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Searching Patients:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Basic Search:</strong> Use the search bar to find by name or address</li>
              <li><strong>Advanced Search:</strong> Click the filter icon for more options</li>
              <li><strong>Filter by Disease:</strong> Select specific diseases from the dropdown</li>
              <li><strong>Sort Results:</strong> Click column headers to sort</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Updating Patient Information:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Find the patient in the list</li>
              <li>Click on the patient name or "Edit" button</li>
              <li>Update the information in the modal</li>
              <li>Click <strong>"Update Patient"</strong> to save changes</li>
            </ol>
          </div>
        </div>
      )
    },
    'medical-records': {
      title: 'Medical Records',
      icon: <FaFileAlt className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Creating Medical Records:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <strong>Records</strong> page</li>
              <li>Click <strong>"Add New Record"</strong></li>
              <li>Select the patient from the dropdown</li>
              <li>Fill in medical information (Diagnosis, Symptoms, Treatment, etc.)</li>
              <li>Add consultation details and medical advice</li>
              <li>Click <strong>"Save Record"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Medical Record Fields:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Basic Info:</strong>
                <ul className="list-disc list-inside ml-2">
                  <li>Patient Name</li>
                  <li>Date of Birth</li>
                  <li>PhilHealth ID</li>
                  <li>Priority Level</li>
                </ul>
              </div>
              <div>
                <strong>Medical Info:</strong>
                <ul className="list-disc list-inside ml-2">
                  <li>Diagnosis</li>
                  <li>Symptoms</li>
                  <li>Treatment</li>
                  <li>Medical Advice</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Searching Records:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use the search bar to find by patient name or diagnosis</li>
              <li>Filter by disease type using the dropdown</li>
              <li>Sort by date, patient name, or diagnosis</li>
              <li>Use date range filters for specific periods</li>
            </ul>
          </div>
        </div>
      )
    },
    'disease-management': {
      title: 'Disease Management',
      icon: <FaShieldAlt className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Adding Diseases:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <strong>Diseases</strong> page</li>
              <li>Click <strong>"Add Disease"</strong> button</li>
              <li>Enter disease name, description, and symptoms</li>
              <li>Add incubation and contagious periods</li>
              <li>Choose color and icon for visualization</li>
              <li>Click <strong>"Save Disease"</strong></li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Disease Analytics:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>View disease trends and statistics</li>
              <li>Monitor outbreak patterns</li>
              <li>Generate disease-specific reports</li>
              <li>Track disease progression over time</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Forecasting:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Access ARIMA forecasting for disease trends</li>
              <li>View predicted case numbers</li>
              <li>Export forecast data for analysis</li>
              <li>Set up alerts for high-risk scenarios</li>
            </ul>
          </div>
        </div>
      )
    },
    'reports-analytics': {
      title: 'Reports & Analytics',
      icon: <FaChartBar className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Dashboard Overview:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Statistics:</strong> Total patients, active cases, recent consultations</li>
              <li><strong>Disease Trends:</strong> Visual charts showing disease patterns</li>
              <li><strong>Recent Activities:</strong> Latest system activities and updates</li>
              <li><strong>Alerts:</strong> Important notifications and warnings</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Generating Reports:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to <strong>Reports</strong> page</li>
              <li>Select report type (Patient Summary, Disease Analysis, etc.)</li>
              <li>Set date range and filters</li>
              <li>Click <strong>"Generate Report"</strong></li>
              <li>Export as PDF or Excel if needed</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Export:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Export patient data for external analysis</li>
              <li>Generate RHU export files for government reporting</li>
              <li>Create custom reports with specific criteria</li>
            </ul>
          </div>
        </div>
      )
    },
    'system-admin': {
      title: 'System Administration',
      icon: <FaCog className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">User Management:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Add new users (Admin/Staff roles)</li>
              <li>Reset passwords and manage access</li>
              <li>View user activity logs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">System Settings:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Set session timeout preferences</li>
              <li>Adjust notification settings</li>
              <li>Manage system preferences</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Audit & Security:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>View audit logs for all system activities</li>
              <li>Monitor user login attempts</li>
              <li>Track data modifications</li>
              <li>Export audit reports for compliance</li>
            </ul>
          </div>
        </div>
      )
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FaQuestionCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">TRACELY Help Center</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-2">
                {Object.entries(helpSections).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === key
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {helpSections[activeSection] && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    {helpSections[activeSection].icon}
                    <h3 className="text-lg font-semibold">{helpSections[activeSection].title}</h3>
                  </div>
                  {helpSections[activeSection].content}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-end text-sm text-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;

