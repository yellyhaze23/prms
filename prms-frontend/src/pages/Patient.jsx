import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Toolbar from "../components/Toolbar";
import PatientList from "../components/PatientList";
import AddPatient from "../components/AddPatient";
import ConfirmationModal from "../components/ConfirmationModal";
import ModernToast from "../components/ModernToast";
import Pagination from "../components/Pagination";
import SortControl from "../components/SortControl";
import SearchInput from "../components/SearchInput";
import HelpTooltip from "../components/HelpTooltip";
import notificationService from "../utils/notificationService";
// Performance optimizations
import { getCachedData, setCachedData, shouldRefreshInBackground, markAsRefreshed } from '../utils/cache';
import { preloadData } from '../utils/dataPreloader';
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  buttonVariants,
  hoverScale 
} from '../utils/animations';

function Patient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [toast, setToast] = useState(null); 
  const [confirmModal, setConfirmModal] = useState(null);
  const [error, setError] = useState(null);
  
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
        showToast("Failed to fetch patients", "error");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
      showToast("Server error. Please check your connection.", "error");
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


  const showToast = (message, type = "success", title = null) => {
    setToast({ 
      isVisible: true, 
      message, 
      type,
      title: title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info!')
    });
  };

  const handleAddPatient = async (newPatient) => {
    setPatients([...patients, newPatient]);
    showToast("Patient added successfully", "success");
    
    // Send notification
    try {
      await notificationService.notifyPatientAdded(newPatient.full_name || 'New Patient');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleUpdatePatient = async (updatedPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    showToast("Patient updated successfully", "success");
    
    // Send notification
    try {
      await notificationService.notifyPatientUpdated(updatedPatient.full_name || 'Patient');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleDeletePatient = (id) => {
    const patient = patients.find(p => p.id === id);
    setConfirmModal({
      message: "Are you sure you want to delete this patient?",
      onConfirm: async () => {
        try {
          await axios.post("http://localhost/prms/prms-backend/delete_patient.php", {
            id,
          });
          setPatients((prev) => prev.filter((p) => p.id !== id));
          showToast("Patient deleted successfully", "delete", "Deleted!");
          
          // Send notification
          try {
            await notificationService.notifyPatientDeleted(patient?.full_name || 'Patient');
          } catch (error) {
            console.error('Error sending notification:', error);
          }
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
    <motion.div 
      className="min-h-screen bg-gray-50 py-6" 
      style={{minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1.5rem 0'}}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 " style={{maxWidth: '80rem', margin: '0 auto', padding: '0 2rem'}}>
        {/* Modern Header with Controls */}
        <motion.div 
          className="mb-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div variants={cardVariants}>
              <h1 className="text-3xl font-bold text-blue-600">Patient Records</h1>
              <p className="text-gray-700 mt-2">Manage patient records</p>
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
                <HelpTooltip
                  content="Search patients by name, address, contact number, or patient ID. Use partial matches for faster results."
                  position="bottom"
                  size="md"
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
                    { value: 'contact_number', label: 'Sort by: Contact' },
                    { value: 'created_at', label: 'Sort by: Date' },
                  ]}
                />
                <HelpTooltip
                  content="Sort patients by different criteria. Click the sort button to toggle between ascending and descending order."
                  position="bottom"
                  size="md"
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
                <HelpTooltip
                  content="Add a new patient to the system. Fill in the required information including name, date of birth, gender, and address."
                  position="bottom"
                  size="md"
                />
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
            onDelete={handleDeletePatient}
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
        <ModernToast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  );
}

export default Patient;
