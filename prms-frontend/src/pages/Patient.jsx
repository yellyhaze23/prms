import React, { useState, useEffect } from "react";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import PatientList from "../components/PatientList";
import AddPatient from "../components/AddPatient";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";
// Performance optimizations
import { getCachedData, setCachedData, shouldRefreshInBackground, markAsRefreshed } from '../utils/cache';
import { preloadData } from '../utils/dataPreloader';

function Patient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [toast, setToast] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm]);

  const fetchPatients = async (forceRefresh = false) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchTerm
      });

      const response = await axios.get(`http://localhost/prms/prms-backend/get_patients.php?${params}`);
      
      if (response.data.success) {
        setPatients(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
        setError(null);
      } else {
        setError("Failed to fetch patients");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePageChange = (page, newItemsPerPage) => {
    setCurrentPage(page);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };


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
          onSearch={handleSearch}
          onSort={handleSort}
          sortOrder={sortOrder}
          onToggleSortOrder={toggleSortOrder}
          onAdd={() => {
            setEditPatient(null);
            setShowAddModal(true);
          }}
        />

        {/* Patient List */}
        <PatientList
          patients={patients}
          loading={loading}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalRecords}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
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
