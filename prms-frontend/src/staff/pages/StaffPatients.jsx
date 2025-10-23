import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../lib/api/axios";
import PatientList from "../../components/PatientList";
import StaffAddPatient from "../components/StaffAddPatient";
import ConfirmationModal from "../../components/ConfirmationModal";
import Toast from "../../components/Toast";
import Pagination from "../../components/Pagination";
import SearchInput from "../../components/SearchInput";
import SortControl from "../../components/SortControl";
import { FaUserFriends } from "react-icons/fa";
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../../utils/animations';

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

    api
      .get(`/patients.php?${params}`)
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
    // Refresh the list to get complete data
    fetchPatients();
    showToast("Patient added successfully", "success");
  };

  const handleUpdatePatient = (updatedPatient) => {
    // Refresh the list to get complete updated data
    fetchPatients();
    showToast("Patient updated successfully", "success");
  };

  const handleEditPatient = (patient) => {
    setEditPatient(patient);
    setShowAddModal(true);
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modern Header - Enhanced like Admin Portal */}
      <motion.div 
        className="mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-blue-600">My Patients</h1>
            <p className="text-gray-700 mt-2">Manage your assigned patients</p>
          </motion.div>
          
          {/* Controls on the right */}
          <motion.div 
            className="flex items-center space-x-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Modern Search Input */}
            <motion.div variants={cardVariants} className="flex items-center space-x-2">
              <SearchInput
                placeholder="Search patients by name, address, or ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-80"
              />
            </motion.div>

            {/* Sort Controls */}
            <motion.div variants={cardVariants} className="flex items-center space-x-2">
              <SortControl
                value={sortBy}
                order={sortOrder}
                onChange={(val) => handleSort(val)}
                onToggleOrder={toggleSortOrder}
                options={[
                  { value: 'id', label: 'Sort by: ID' },
                  { value: 'full_name', label: 'Sort by: Name' },
                  { value: 'created_at', label: 'Sort by: Date' },
                ]}
              />
            </motion.div>

            {/* Add Patient Button */}
            <motion.div variants={cardVariants} className="flex items-center space-x-2">
              <motion.button
                onClick={() => {
                  setEditPatient(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                whileHover={buttonVariants.hover}
                whileTap={buttonVariants.tap}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Patient</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Patient List */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <PatientList
          patients={patients}
          loading={loading}
          onEdit={handleEditPatient}
          onDelete={null} // No delete functionality for staff
        />
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalRecords}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </motion.div>
      )}
      
      {showAddModal && (
        <StaffAddPatient
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
    </motion.div>
  );
}

export default StaffPatients;
