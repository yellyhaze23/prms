import React, { useState, useEffect } from "react";
import axios from "axios";
import Toolbar from "../../components/Toolbar";
import PatientList from "../../components/PatientList";
import AddPatient from "../../components/AddPatient";
import ConfirmationModal from "../../components/ConfirmationModal";
import Toast from "../../components/Toast";
import Pagination from "../../components/Pagination";
import { FaUserFriends } from "react-icons/fa";

function StaffPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    fetchPatients();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm]);

  const fetchPatients = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortBy,
      sortOrder: sortOrder,
      q: searchTerm
    });

    axios
      .get(`http://localhost/prms/prms-backend/api/staff/patients.php?${params}`)
      .then((res) => {
        if (res.data.success) {
          setPatients(res.data.data || []);
          setTotalPages(res.data.pagination.totalPages);
          setTotalRecords(res.data.pagination.totalRecords);
        }
      })
      .catch((err) => {
        console.error("Error fetching patients:", err);
      })
      .finally(() => {
        setLoading(false);
      });
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
          onDelete={null} // No delete functionality for staff
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
