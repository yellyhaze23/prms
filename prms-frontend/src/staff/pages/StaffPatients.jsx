import React, { useState, useEffect } from "react";
import axios from "axios";
import Toolbar from "../../components/Toolbar";
import PatientList from "../../components/PatientList";
import AddPatient from "../../components/AddPatient";
import ConfirmationModal from "../../components/ConfirmationModal";
import Toast from "../../components/Toast";
import { FaUserFriends } from "react-icons/fa";

function StaffPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [toast, setToast] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null); 

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    axios
      .get("http://localhost/prms/prms-backend/api/staff/patients.php")
      .then((res) => {
        setPatients(res.data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching patients:", err);
      });
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredPatients = [...patients]
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        (p.full_name || "").toLowerCase().includes(term) ||
        (p.id || "").toString().includes(term) ||
        (p.address || "").toLowerCase().includes(term) ||
        (p.contact_number || "").includes(term)
      );
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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleAddPatient = (newPatient) => {
    setPatients([...patients, newPatient]);
    showToast("Patient added successfully", "success");
  };

  const handleUpdatePatient = (updatedPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    showToast("Patient updated successfully", "success");
  };

  const handleEditPatient = (patient) => {
    setEditPatient(patient);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Patients</h1>
            <p className="text-blue-100 mt-1">Manage your assigned patients</p>
          </div>
          <FaUserFriends className="h-8 w-8 text-white" />
        </div>
      </div>

        {/* Toolbar */}
        <Toolbar
          onSearch={setSearchTerm}
          onSort={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={toggleSortOrder}
          onAdd={() => {
            setEditPatient(null);
            setShowAddModal(true);
          }}
        />

        {/* Patient List */}
        <PatientList
          patients={filteredPatients}
          onEdit={handleEditPatient}
          onDelete={null} // No delete functionality for staff
        />
      
      {showAddModal && (
        <AddPatient
          patient={editPatient}
          onClose={() => setShowAddModal(false)}
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

export default StaffPatients;
