import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toolbar from '../components/Toolbar';
import Return from '../components/Return';
import AddPatient from '../components/AddPatient';
import Toast from '../components/Toast';
import Tabs from '../components/Tabs';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash, FaStethoscope, FaFilter } from 'react-icons/fa';

function Records() {
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Fetch patients
    axios.get("http://localhost/prms/prms-backend/get_patients.php")
      .then((res) => {
        setPatients(res.data);
      })
      .catch((err) => {
        console.error("Error fetching patients:", err);
      });

    // Fetch diseases
    axios.get("http://localhost/prms/prms-backend/get_diseases.php")
      .then((res) => {
        setDiseases(res.data);
      })
      .catch((err) => {
        console.error("Error fetching diseases:", err);
      });
  }, []);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleEditBasicInfo = (patient) => {
    setEditPatient(patient);
    setShowAddModal(true);
  };

  const handleDeletePatient = (patientId) => {
    setConfirmModal({
      message: "Are you sure you want to delete this patient? This action cannot be undone.",
      onConfirm: () => {
        axios.delete(`http://localhost/prms/prms-backend/delete_patient.php`, {
          data: { id: patientId }
        })
        .then(() => {
          setPatients(patients.filter(p => p.id !== patientId));
          if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient(null);
          }
          showToast("Patient deleted successfully", "success");
          setConfirmModal(null);
        })
        .catch((err) => {
          console.error("Error deleting patient:", err);
          showToast("Error deleting patient", "error");
          setConfirmModal(null);
        });
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleAddPatient = (newPatient) => {
    setPatients([...patients, newPatient]);
    showToast("Patient added successfully", "success");
  };

  const handleUpdatePatient = (updatedPatient) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient && selectedPatient.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
    showToast("Patient updated successfully", "success");
  };

  const filteredPatients = [...patients]
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        (p.full_name || "").toLowerCase().includes(term) ||
        (p.contact_number || "").toLowerCase().includes(term) ||
        (p.email || "").toLowerCase().includes(term) ||
        (p.address || "").toLowerCase().includes(term) ||
        (p.sex || "").toLowerCase().includes(term) ||
        (p.previous_illness || "").toLowerCase().includes(term) ||
        (p.status || "").toLowerCase().includes(term) ||
        (p.severity || "").toLowerCase().includes(term)
      );

      // Filter by disease
      if (selectedDisease === "all") {
        return matchesSearch;
      } else if (selectedDisease === "healthy") {
        return matchesSearch && (!p.previous_illness || p.previous_illness.trim() === '');
      } else {
        return matchesSearch && p.previous_illness && p.previous_illness.toLowerCase() === selectedDisease.toLowerCase();
      }
    })

    .sort((a, b) => {
      if (!sortBy) return 0;

      const valA = a[sortBy] ?? "";
      const valB = b[sortBy] ?? "";

      let result;

      if (sortBy === "id") {
        result = Number(valA) - Number(valB);
      } else {
        result = valA.toString().toLowerCase().localeCompare(valB.toString().toLowerCase());
      }

      return sortOrder === "asc" ? result : -result;
    });

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedPatient ? (
          <>
            {/* Header */}
            <div className="mb-8 bg-blue-600 p-4 rounded-lg">
              <h1 className="text-3xl font-bold text-white">Medical Records</h1>
              <p className="mt-2 text-blue-100">View and manage patient medical records</p>
            </div>

                {/* Toolbar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search patients by name, contact, address, or disease..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Disease Filter */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FaStethoscope className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Filter by Disease:</span>
                      </div>
                      <select
                        className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedDisease}
                        onChange={(e) => setSelectedDisease(e.target.value)}
                      >
                        <option value="all">All Patients</option>
                        <option value="healthy">Healthy Patients</option>
                        {diseases.map((disease) => (
                          <option key={disease.id} value={disease.name}>
                            {disease.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={toggleSortOrder}
                          title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
                        >
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <FaUser className="text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No medical records found</p>
                  <p className="text-gray-400 text-sm">Patient records will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="text-gray-400" />
                            ID
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400" />
                            Patient Name
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            Age & Gender
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            Contact
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-400" />
                            Address
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaStethoscope className="text-gray-400" />
                            Disease Status
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            Last Visit
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPatients.map((patient, index) => (
                        <tr
                          key={patient.id || index}
                          onClick={() => setSelectedPatient(patient)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{patient.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FaUser className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.full_name}
                                </div>
                                {/* <div className="text-sm text-gray-500">
                                  {patient.patient_id || 'No ID'}
                                </div> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{patient.age ? `${patient.age} years old` : 'N/A'}</div>
                              <div className="text-gray-500">{patient.sex || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              {patient.contact_number && (
                                <div className="flex items-center gap-1">
                                  <FaPhone className="h-3 w-3 text-gray-400" />
                                  <span>{patient.contact_number}</span>
                                </div>
                              )}
                              {patient.email && (
                                <div className="flex items-center gap-1">
                                  <FaEnvelope className="h-3 w-3 text-gray-400" />
                                  <span className="truncate max-w-32">{patient.email}</span>
                                </div>
                              )}
                              {!patient.contact_number && !patient.email && (
                                <span className="text-gray-400">No contact info</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={patient.address}>
                              {patient.address || 'No address provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.previous_illness ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <FaStethoscope className="h-3 w-3 text-red-500" />
                                  <span className="font-medium text-red-600">{patient.previous_illness}</span>
                                </div>
                                {patient.status && (
                                  <div className="text-xs text-gray-500">
                                    Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      patient.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                                      patient.status === 'suspected' ? 'bg-yellow-100 text-yellow-800' :
                                      patient.status === 'recovered' ? 'bg-green-100 text-green-800' :
                                      patient.status === 'quarantined' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                                    </span>
                                  </div>
                                )}
                                {patient.severity && (
                                  <div className="text-xs text-gray-500">
                                    Severity: <span className="font-medium">{patient.severity}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-600">
                                <FaStethoscope className="h-3 w-3" />
                                <span className="text-sm">Healthy</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 
                             patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                                title="Edit Medical Records"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                title="Delete Patient"
                                onClick={() => handleDeletePatient(patient.id)}
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Return onBack={() => setSelectedPatient(null)} />
            <Tabs 
              patient={selectedPatient} 
              onEdit={handleEditBasicInfo}
              onDelete={handleDeletePatient}
            />
          </>
        )}
      </div>

      {/* Modals and Toast */}
      {showAddModal && (
        <AddPatient
          patient={editPatient}
          onClose={() => {
            setShowAddModal(false);
            setEditPatient(null);
          }}
          onConfirm={editPatient ? handleUpdatePatient : handleAddPatient}
        />
      )}

      {confirmModal && (
        <ConfirmationModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Records;
