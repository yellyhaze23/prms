import React, { useState, useEffect } from "react";
import { FaVirus, FaExclamationTriangle, FaChartLine, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaStethoscope, FaShieldAlt, FaThermometerHalf, FaEye, FaLungs, FaHeartbeat, FaPlus } from "react-icons/fa";
import axios from "axios";
import DiseaseCaseForm from "./DiseaseCaseForm";
import "../admin/Dashboard.css";

const diseases = [
  {
    id: "chickenpox",
    name: "Chickenpox",
    icon: FaVirus,
    color: "red",
    description: "Varicella-zoster virus infection causing itchy rash",
    symptoms: ["Itchy rash", "Fever", "Fatigue", "Headache", "Loss of appetite"],
    incubation: "10-21 days",
    contagious: "1-2 days before rash until all lesions crusted"
  },
  {
    id: "measles",
    name: "Measles",
    icon: FaExclamationTriangle,
    color: "orange",
    description: "Highly contagious viral disease with characteristic rash",
    symptoms: ["High fever", "Cough", "Runny nose", "Red eyes", "Koplik spots", "Rash"],
    incubation: "7-14 days",
    contagious: "4 days before to 4 days after rash appears"
  },
  {
    id: "tuberculosis",
    name: "Tuberculosis",
    icon: FaLungs,
    color: "blue",
    description: "Bacterial infection primarily affecting the lungs",
    symptoms: ["Persistent cough", "Chest pain", "Coughing up blood", "Fatigue", "Weight loss", "Night sweats"],
    incubation: "2-12 weeks",
    contagious: "Only when active and untreated"
  },
  {
    id: "hepatitis",
    name: "Hepatitis",
    icon: FaHeartbeat,
    color: "green",
    description: "Inflammation of the liver caused by viral infection",
    symptoms: ["Jaundice", "Fatigue", "Abdominal pain", "Dark urine", "Pale stool", "Nausea"],
    incubation: "15-50 days",
    contagious: "Varies by type (A, B, C)"
  },
  {
    id: "dengue",
    name: "Dengue",
    icon: FaThermometerHalf,
    color: "purple",
    description: "Mosquito-borne viral infection causing severe flu-like illness",
    symptoms: ["High fever", "Severe headache", "Pain behind eyes", "Muscle pain", "Nausea", "Rash"],
    incubation: "3-14 days",
    contagious: "Not directly person-to-person"
  }
];

function DiseaseTracker() {
  const [activeDisease, setActiveDisease] = useState("chickenpox");
  const [diseaseData, setDiseaseData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);

  useEffect(() => {
    fetchDiseaseData();
  }, [activeDisease]);

  const fetchDiseaseData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost/prms/prms-backend/get_disease_data.php?disease=${activeDisease}`);
      setDiseaseData(response.data);
    } catch (error) {
      console.error("Error fetching disease data:", error);
      // Fallback to mock data if API fails
      const mockData = {
        chickenpox: {
          totalCases: 45,
          activeCases: 12,
          recovered: 33,
          newCases: 3,
          riskLevel: "moderate",
          trend: "increasing",
          lastOutbreak: "2024-01-15"
        },
        measles: {
          totalCases: 23,
          activeCases: 8,
          recovered: 15,
          newCases: 2,
          riskLevel: "high",
          trend: "stable",
          lastOutbreak: "2024-02-01"
        },
        tuberculosis: {
          totalCases: 67,
          activeCases: 15,
          recovered: 52,
          newCases: 1,
          riskLevel: "low",
          trend: "decreasing",
          lastOutbreak: "2023-12-10"
        },
        hepatitis: {
          totalCases: 34,
          activeCases: 9,
          recovered: 25,
          newCases: 0,
          riskLevel: "low",
          trend: "stable",
          lastOutbreak: "2023-11-20"
        },
        dengue: {
          totalCases: 89,
          activeCases: 21,
          recovered: 68,
          newCases: 5,
          riskLevel: "high",
          trend: "increasing",
          lastOutbreak: "2024-02-15"
        }
      };
      setDiseaseData(mockData[activeDisease] || {});
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "high": return "text-red-600 bg-red-100";
      case "moderate": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing": return "↗️";
      case "decreasing": return "↘️";
      case "stable": return "→";
      default: return "→";
    }
  };

  const currentDisease = diseases.find(d => d.id === activeDisease);
  const IconComponent = currentDisease?.icon || FaVirus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaStethoscope className="h-8 w-8 mr-3 text-blue-600" />
              Disease Surveillance System
            </h1>
            <p className="text-gray-600 mt-2">Monitor and track communicable diseases in your community</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Disease Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-1" aria-label="Disease Tabs">
            {diseases.map((disease) => {
              const Icon = disease.icon;
              const isActive = activeDisease === disease.id;
              return (
                <button
                  key={disease.id}
                  onClick={() => setActiveDisease(disease.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? `bg-${disease.color}-100 text-${disease.color}-700 border-2 border-${disease.color}-300`
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {disease.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Disease Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading disease data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Disease Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full bg-${currentDisease?.color}-100`}>
                    <IconComponent className={`h-8 w-8 text-${currentDisease?.color}-600`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentDisease?.name}</h2>
                    <p className="text-gray-600">{currentDisease?.description}</p>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="modern-summary-card">
                  <div className="flex items-center">
                    <div className="modern-icon-container bg-blue-50">
                      <FaUsers className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="modern-card-label">Total Cases</p>
                      <p className="modern-card-value">{diseaseData.totalCases || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="modern-summary-card">
                  <div className="flex items-center">
                    <div className="modern-icon-container bg-red-50">
                      <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="modern-card-label">Active Cases</p>
                      <p className="modern-card-value">{diseaseData.activeCases || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="modern-summary-card">
                  <div className="flex items-center">
                    <div className="modern-icon-container bg-green-50">
                      <FaChartLine className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="modern-card-label">Recovered</p>
                      <p className="modern-card-value">{diseaseData.recovered || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="modern-summary-card">
                  <div className="flex items-center">
                    <div className="modern-icon-container bg-purple-50">
                      <FaCalendarAlt className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="modern-card-label">New Cases (7d)</p>
                      <p className="modern-card-value">{diseaseData.newCases || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment and Trend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(diseaseData.riskLevel)}`}>
                      {diseaseData.riskLevel?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    <span className="text-gray-600">
                      {diseaseData.riskLevel === 'high' && 'Immediate action required'}
                      {diseaseData.riskLevel === 'moderate' && 'Monitor closely'}
                      {diseaseData.riskLevel === 'low' && 'Under control'}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTrendIcon(diseaseData.trend)}</span>
                    <span className="text-gray-600 capitalize">
                      {diseaseData.trend || 'stable'} trend
                    </span>
                  </div>
                </div>
              </div>

              {/* Disease Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Symptoms</h3>
                  <ul className="space-y-2">
                    {currentDisease?.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Incubation Period:</span>
                      <span className="ml-2 text-gray-600">{currentDisease?.incubation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Contagious Period:</span>
                      <span className="ml-2 text-gray-600">{currentDisease?.contagious}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Outbreak:</span>
                      <span className="ml-2 text-gray-600">{diseaseData.lastOutbreak || 'None recorded'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowDiseaseForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add Disease Case
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                  <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                  View on Map
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                  <FaShieldAlt className="h-4 w-4 mr-2" />
                  Vaccination Records
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
                  <FaChartLine className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200">
                  <FaExclamationTriangle className="h-4 w-4 mr-2" />
                  Alert Health Officials
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disease Case Form Modal */}
      {showDiseaseForm && (
        <DiseaseCaseForm
          onClose={() => setShowDiseaseForm(false)}
          onConfirm={(newCase) => {
            setShowDiseaseForm(false);
            fetchDiseaseData(); // Refresh data
          }}
          disease={activeDisease}
        />
      )}
    </div>
  );
}

export default DiseaseTracker;
