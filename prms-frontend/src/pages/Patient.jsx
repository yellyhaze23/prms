import React, { useState, useEffect } from "react";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import PatientList from "../components/PatientList";
import AddPatient from "../components/AddPatient";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";

function Patient() {
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
      .get("http://localhost/prms/prms-backend/get_patients.php")
      .then((res) => {
        setPatients(res.data);
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
        (p.patient_id || "").toLowerCase().includes(term) ||
        (p.course_year_section || "").toLowerCase().includes(term) ||
        (p.department || "").toLowerCase().includes(term)
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

  const handleDeletePatient = (id) => {
    setConfirmModal({
      message: "Are you sure you want to delete this patient?",
      onConfirm: async () => {
        try {
          await axios.post("http://localhost/prms/prms-backend/delete_patient.php", {
            id,
          });
          setPatients((prev) => prev.filter((p) => p.id !== id));
          showToast("Patient deleted successfully", "error");
        } catch (err) {
          showToast("Failed to delete patient", "error");
          console.error(err);
        } finally {
          setConfirmModal(null);
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleEditPatient = (patient) => {
    setEditPatient(patient);
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6" style={{minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1.5rem 0'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 " style={{maxWidth: '80rem', margin: '0 auto', padding: '0 2rem'}}>
        {/* Header */}
        <div className="mb-8 bg-red-500 p-4 rounded-lg">
          <h1 className="text-3xl font-bold text-white">Patient Records</h1>
          <p className="mt-2 text-white">Manage patient records</p>
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
          onDelete={handleDeletePatient}
        />
      </div>
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

export default Patient;
