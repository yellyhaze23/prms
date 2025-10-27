import React, { useState } from 'react';
import { FaFileMedicalAlt } from 'react-icons/fa';
import MedicalRecords from './MedicalRecords';

const Tabs = ({ patient, onEdit, onDelete, onPatientUpdate }) => {
  const [activeTab, setActiveTab] = useState('medical');

  const tabs = [
    {
      id: 'medical',
      name: 'Medical Records',
      icon: FaFileMedicalAlt,
      component: MedicalRecords
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {ActiveComponent && (
          <ActiveComponent 
            patient={patient} 
            onEdit={onEdit}
            onDelete={onDelete}
            onPatientUpdate={onPatientUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Tabs;

