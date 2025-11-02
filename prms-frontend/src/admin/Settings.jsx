import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaCog, FaEdit, FaTrash, FaClock, FaUser, FaShieldAlt, FaEllipsisV, FaDatabase, FaDownload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaKey, FaFileAlt, FaMapMarkerAlt, FaEnvelope, FaPhone, FaBriefcase, FaHospital, FaCamera, FaIdCard, FaInfoCircle, FaCode, FaServer } from "react-icons/fa";
import SettingsToolbar from "../components/SettingsToolbar";
import UserModal from "../components/AddUser";
import UserProfileModal from "../components/UserProfileModal";
import ModernToast from "../components/ModernToast";
import ConfirmationModal from "../components/ConfirmationModal";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import SortControl from "../components/SortControl";
import { useBackup } from "../contexts/BackupContext";
// Animation variants
import { 
  pageVariants, 
  containerVariants, 
  cardVariants, 
  listItemVariants,
  buttonVariants,
  hoverScale 
} from '../utils/animations';

import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("users"); // users | profile | account | security | activity | backup | about
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Activity logs pagination state
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activityItemsPerPage, setActivityItemsPerPage] = useState(25);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotalRecords, setActivityTotalRecords] = useState(0);
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activitySortBy, setActivitySortBy] = useState('created_at');
  const [activitySortOrder, setActivitySortOrder] = useState('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, userId: null });
  const [isReauthRequired, setIsReauthRequired] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // User profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Modern controls options
  const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'username', label: 'Username' },
    { value: 'role', label: 'Role' },
    { value: 'status', label: 'Status' },
    { value: 'created_at', label: 'Date Created' }
  ];

  const activitySortOptions = [
    { value: 'created_at', label: 'Date' },
    { value: 'username', label: 'User' },
    { value: 'activity_type', label: 'Activity' }
  ];

  // Account change password state
  const [account, setAccount] = useState({
    username: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Profile state
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    rhu_name: "",
    rhu_address: "",
    profile_picture: null
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // Settings state
  const [settings, setSettings] = useState({
    session_timeout_minutes: 30,
    session_warning_minutes: 5,
  });

  // Password validation state
  const [passwordErrors, setPasswordErrors] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(false);

  // Fetch admin profile
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_admin_profile.php`, {
        withCredentials: true
      });
      if (response.data.success && response.data.data) {
        setProfile({
          full_name: response.data.data.full_name || "",
          email: response.data.data.email || "",
          phone: response.data.data.phone || "",
          position: response.data.data.position || "",
          department: response.data.data.department || "",
          rhu_name: response.data.data.rhu_name || "",
          rhu_address: response.data.data.rhu_address || "",
          profile_picture: null
        });
        // Also set account username
        setAccount(prev => ({
          ...prev,
          username: response.data.data.username || "",
          currentUsername: response.data.data.username || "",
          role: response.data.data.role || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setToast({ message: "Failed to load profile data", type: "error" });
      setTimeout(() => setToast({ message: "", type: "error" }), 3000);
    } finally {
      setProfileLoading(false);
    }
  };

  // Password validation functions
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handlePasswordChange = (field, value) => {
    setAccount({...account, [field]: value});
    
    // Clear previous error for this field
    setPasswordErrors({...passwordErrors, [field]: ""});
    
    // Validate new password
    if (field === "new_password") {
      const error = validatePassword(value);
      setPasswordErrors({...passwordErrors, new_password: error});
    }
    
    // Check password match
    if (field === "new_password" || field === "confirm_password") {
      const newPassword = field === "new_password" ? value : account.new_password;
      const confirmPassword = field === "confirm_password" ? value : account.confirm_password;
      setPasswordMatch(newPassword === confirmPassword && newPassword !== "");
    }
  };

  // Global backup context
  const { 
    globalBackupState, 
    backupFiles, 
    fetchBackupFiles, 
    startBackup, 
    cancelBackup, 
    restoreBackup, 
    deleteBackup, 
    downloadBackup,
    getDatabaseSize 
  } = useBackup();

  // Local backup state for UI
  const [backupConfirmModal, setBackupConfirmModal] = useState({ show: false, action: '', file: null });
  const [databaseSize, setDatabaseSize] = useState(null);
  const [activeBackupMenu, setActiveBackupMenu] = useState(null);


  const showToast = (message, type = "success") => {
    setToast({ message, type });
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, 4000);
  };

  const toggleBackupMenu = (filename) => {
    setActiveBackupMenu(activeBackupMenu === filename ? null : filename);
  };

  // Load profile data on component mount
  React.useEffect(() => {
    fetchProfile();
  }, []);

  // Close backup menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeBackupMenu && !event.target.closest('.backup-menu-container')) {
        setActiveBackupMenu(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && activeBackupMenu) {
        setActiveBackupMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeBackupMenu]);

  // Backup functions using global context
  const createBackup = () => {
    startBackup();
  };

  const handleBackupAction = (action, filename = null) => {
    console.log('handleBackupAction called with:', { action, filename });
    setBackupConfirmModal({ show: true, action, file: filename });
    console.log('Modal state set to:', { show: true, action, file: filename });
  };

  const confirmBackupAction = () => {
    const { action, file } = backupConfirmModal;
    console.log('Confirming backup action:', { action, file });
    setBackupConfirmModal({ show: false, action: '', file: null });
    
    switch (action) {
      case 'restore':
        console.log('Calling restoreBackup with:', file);
        restoreBackup(file);
        break;
      case 'delete':
        console.log('Calling deleteBackup with:', file);
        deleteBackup(file);
        break;
      default:
        console.log('Unknown action:', action);
        break;
    }
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_users.php`);
    if (res.data.success) setUsers(res.data.users);
  };

  const fetchUserProfile = async (userId) => {
    setLoadingProfile(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_user_profile.php?id=${userId}`);
      if (res.data.success) {
        setSelectedUserProfile(res.data.user);
        setProfileModalOpen(true);
      } else {
        showToast(res.data.message || 'Failed to load user profile', 'error');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showToast('Error loading user profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleRowClick = (user) => {
    fetchUserProfile(user.id);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedUserProfile(null);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_settings.php`);
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/update_settings.php`, settings);
      if (res.data.success) {
        showToast('Session settings updated successfully!', 'success');
        fetchSettings(); // Refresh settings
      } else {
        showToast(res.data.message || 'Failed to update session settings', 'error');
      }
    } catch (error) {
      showToast('Failed to update session settings', 'error');
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: activityCurrentPage,
        limit: activityItemsPerPage,
        sortBy: activitySortBy,
        sortOrder: activitySortOrder,
        search: activitySearchTerm
      });

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_activity_logs.php?${params}`);
      
      if (response.data.success) {
        setActivityLogs(response.data.data);
        setActivityTotalPages(response.data.pagination.totalPages);
        setActivityTotalRecords(response.data.pagination.totalRecords);
      } else {
        setActivityLogs([]);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setActivityLogs([]);
    }
  };

  // (Clinic settings removed)

  useEffect(() => {
    fetchUsers();
    fetchSettings();
    if (activeTab === 'activity') {
      fetchActivityLogs();
    }
    if (activeTab === 'backup') {
      fetchBackupFiles();
      getDatabaseSize().then(size => setDatabaseSize(size));
    }
    // preload username if available from storage
    const storedUser = localStorage.getItem("prms_username");
    if (storedUser) {
      setAccount((a) => ({ ...a, username: storedUser }));
    }
  }, [activeTab, activityCurrentPage, activityItemsPerPage, activitySortBy, activitySortOrder, activitySearchTerm]);

  // Activity logs pagination handlers
  const handleActivityPageChange = (page, newItemsPerPage) => {
    setActivityCurrentPage(page);
    if (newItemsPerPage !== activityItemsPerPage) {
      setActivityItemsPerPage(newItemsPerPage);
      setActivityCurrentPage(1); // Reset to first page when changing page size
    }
  };

  const handleActivitySearch = (term) => {
    setActivitySearchTerm(term);
    setActivityCurrentPage(1); // Reset to first page when searching
  };

  const handleActivitySort = (field) => {
    if (activitySortBy === field) {
      setActivitySortOrder(activitySortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setActivitySortBy(field);
      setActivitySortOrder('desc');
    }
    setActivityCurrentPage(1); // Reset to first page when sorting
  };

  // Modern controls handlers
  const handleSearch = (term) => {
    setSearch(term);
  };

  const handleSort = (field) => {
    setSortKey(field);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Activity logs modern controls handlers
  const handleActivitySortOrderToggle = () => {
    setActivitySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleOpenAddModal = () => {
    setEditing(false);
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditing(true);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setConfirmModal({ show: true, userId: id });
  };

  const handleConfirmedDelete = async () => {
    const id = confirmModal.userId;
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/delete_user.php`, { id });
    showToast(res.data.message, res.data.success ? "error" : "error");
    setConfirmModal({ show: false, userId: null });
    fetchUsers();
  };

  const toggleDropdown = (userId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const handleActionClick = (action, user, e) => {
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch(action) {
      case 'edit':
        handleOpenEditModal(user);
        break;
      case 'delete':
        confirmDelete(user.id);
        break;
      case 'toggle_status':
        toggleUserStatus(user);
        break;
      default:
        break;
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/toggle_user_status.php`, {
        id: user.id,
        status: newStatus
      });
      
      if (res.data.success) {
        showToast(res.data.message, "success");
        fetchUsers(); // Refresh the users list
      } else {
        showToast(res.data.message, "error");
      }
    } catch (error) {
      showToast("Failed to update user status", "error");
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
  };

  // Add event listener for clicking outside
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = async (formData) => {
    const url = editing
      ? `${import.meta.env.VITE_API_BASE_URL}/update_user.php`
      : `${import.meta.env.VITE_API_BASE_URL}/add_user.php`;

    try {
      const res = await axios.post(url, formData);

      if (editing && !res.data.success && res.data.message.toLowerCase().includes("old password")) {
        return res.data;
      }

      if (!res.data.success) {
        return res.data;
      }

      showToast(res.data.message, "success");
      setIsModalOpen(false);
      fetchUsers();
      return res.data;
    } catch (err) {
      return { success: false, message: "Server error. Please try again." };
    }
  };

  const filteredUsers = React.useMemo(() => {
    const filtered = [...users]
      .filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toString().includes(search)
      );
    
    const sorted = filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (sortKey === 'id') {
        aVal = parseInt(a.id);
        bVal = parseInt(b.id);
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else if (sortKey === 'created_at') {
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else if (sortKey === 'username') {
        aVal = (a.username || '').toLowerCase();
        bVal = (b.username || '').toLowerCase();
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        // Fallback for other fields
        aVal = a[sortKey]?.toString().toLowerCase() || '';
        bVal = b[sortKey]?.toString().toLowerCase() || '';
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });
    
    return sorted;
  }, [users, search, sortKey, sortOrder]);

  // Filtered and sorted activity logs
  const filteredActivityLogs = React.useMemo(() => {
    const filtered = [...activityLogs]
      .filter((log) =>
        log.username?.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
        log.activity_type?.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(activitySearchTerm.toLowerCase())
      );
    
    const sorted = filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (activitySortBy === 'created_at') {
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
        return activitySortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else if (activitySortBy === 'username') {
        aVal = (a.username || '').toLowerCase();
        bVal = (b.username || '').toLowerCase();
        return activitySortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (activitySortBy === 'activity_type') {
        aVal = (a.activity_type || '').toLowerCase();
        bVal = (b.activity_type || '').toLowerCase();
        return activitySortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        // Fallback for other fields
        aVal = a[activitySortBy]?.toString().toLowerCase() || '';
        bVal = b[activitySortBy]?.toString().toLowerCase() || '';
        return activitySortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });
    
    return sorted;
  }, [activityLogs, activitySearchTerm, activitySortBy, activitySortOrder]);

  // Debug logging for sorting
  React.useEffect(() => {
    console.log('Sorting changed:', { sortKey, sortOrder, userCount: filteredUsers.length });
  }, [sortKey, sortOrder, filteredUsers.length]);

  // Debug logging for activity sorting
  React.useEffect(() => {
    console.log('Activity sorting changed:', { activitySortBy, activitySortOrder, activityCount: filteredActivityLogs.length });
  }, [activitySortBy, activitySortOrder, filteredActivityLogs.length]);

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modern Header with Controls */}
      <motion.div 
        className="mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
            <p className="text-gray-700 mt-2">Manage users, and your account</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 px-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser className="inline h-4 w-4 mr-2" />
          Users
        </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaIdCard className="inline h-4 w-4 mr-2" />
          Profile
        </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCog className="inline h-4 w-4 mr-2" />
          Account
        </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShieldAlt className="inline h-4 w-4 mr-2" />
          Security
        </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaClock className="inline h-4 w-4 mr-2" />
          Activity Logs
        </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaDatabase className="inline h-4 w-4 mr-2" />
              Backup & Restore
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaInfoCircle className="inline h-4 w-4 mr-2" />
              About
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6 min-h-[600px] pb-8" style={{ overflow: 'visible' }}>
          {/* Enhanced Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUser className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Manage system users and permissions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-sm font-medium text-blue-600">{filteredUsers.length} Users</span>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200"
                >
                  <FaUser className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Modern Search and Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Modern Search Input */}
              <SearchInput
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                className="w-80"
              />

              {/* Modern Sort Control */}
              <SortControl
                value={sortKey}
                order={sortOrder}
                options={sortOptions}
                onChange={handleSort}
                onToggleOrder={handleSortOrderToggle}
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]" style={{ overflowY: 'visible' }}>
            <table className="min-w-full divide-y divide-gray-200" key={`users-${sortKey}-${sortOrder}`}>
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>ID</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaUser className="h-3 w-3" />
                    <span>Username</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaShieldAlt className="h-3 w-3" />
                    <span>Role</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaClock className="h-3 w-3" />
                    <span>Created At</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaEllipsisV className="h-3 w-3" />
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.id} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group cursor-pointer"
                  onClick={() => handleRowClick(u)}
                >
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">#{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    <div className="font-medium text-gray-900">{u.username}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1.5 ${
                          u.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        {u.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <FaClock className="h-4 w-4 text-gray-400" />
                      <span>{new Date(u.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700" onClick={(e) => e.stopPropagation()}>
                    <div className="relative dropdown-container">
                      {/* Modern Kebab Menu Button */}
                      <button
                        className="group inline-flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-sm"
                        onClick={(e) => toggleDropdown(u.id, e)}
                        title="More actions"
                      >
                        <FaEllipsisV className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>

                      {/* Modern Dropdown Menu with Animation */}
                      {activeDropdown === u.id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl z-[99999] border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200" style={{zIndex: 99999}}>
                          <div className="py-2">
                            {/* Edit User */}
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-150 group/edit"
                              onClick={(e) => handleActionClick('edit', u, e)}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 group-hover/edit:bg-emerald-200 transition-colors duration-150 mr-3">
                                <FaEdit className="h-3.5 w-3.5 text-emerald-600" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">Edit User</span>
                                <span className="text-xs text-gray-500">Update user information</span>
                              </div>
                            </button>
                            
                            {/* Toggle Status */}
                            <button
                              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 group/toggle"
                              onClick={(e) => handleActionClick('toggle_status', u, e)}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 group-hover/toggle:bg-blue-200 transition-colors duration-150 mr-3">
                                <FaShieldAlt className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {u.status === 'active' ? 'Disable user access' : 'Enable user access'}
                                </span>
                              </div>
                            </button>
                            
                            {/* Delete User - only show if not admin (ID 1) */}
                            {Number(u.id) !== 1 && (
                              <button
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-150 group/delete"
                                onClick={(e) => handleActionClick('delete', u, e)}
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 group-hover/delete:bg-red-200 transition-colors duration-150 mr-3">
                                  <FaTrash className="h-3.5 w-3.5 text-red-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">Delete User</span>
                                  <span className="text-xs text-gray-500">Remove from system</span>
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                        <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria or add a new user</p>
                        <button
                          onClick={handleOpenAddModal}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200"
                        >
                          <FaUser className="h-4 w-4 mr-2" />
                          Add First User
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Clinic tab removed */}

      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FaIdCard className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-600">View and manage your personal and organizational information</p>
                </div>
              </div>
              {account.currentUsername && (
                <div className="bg-white/60 backdrop-blur rounded-lg px-4 py-2 border border-indigo-200">
                  <div className="text-xs text-gray-500">Logged in as</div>
                  <div className="font-semibold text-indigo-700 flex items-center gap-2">
                    <FaUser className="h-3 w-3" />
                    {account.currentUsername}
                    <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                      {account.role}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {profileLoading ? (
            <div className="p-12 text-center">
              <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading profile information...</p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Personal Information</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline h-4 w-4 mr-2 text-gray-500" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profile.full_name || ""} 
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                          profileErrors.full_name 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="Enter your full name"
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    {profileErrors.full_name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1" />
                        {profileErrors.full_name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline h-4 w-4 mr-2 text-gray-500" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="email"
                        value={profile.email || ""} 
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().trim();
                          setProfile({...profile, email: value});
                        }}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                          profileErrors.email 
                            ? "border-red-300 focus:ring-red-500" 
                            : profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
                            ? "border-green-300 focus:ring-green-500"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="your.email@example.com"
                      />
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      {profile.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? (
                            <FaCheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1" />
                        {profileErrors.email}
                      </p>
                    )}
                    {profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) && !profileErrors.email && (
                      <p className="mt-1 text-sm text-green-600 flex items-center">
                        <FaCheckCircle className="h-4 w-4 mr-1" />
                        Valid email format
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline h-4 w-4 mr-2 text-gray-500" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="tel"
                        value={profile.phone || ""} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                          if (value.length <= 11) {
                            setProfile({...profile, phone: value});
                          }
                        }}
                        maxLength={11}
                        pattern="[0-9]{11}"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                          profileErrors.phone 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        placeholder="09171234567"
                      />
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1" />
                        {profileErrors.phone}
                      </p>
                    )}
                    {profile.phone && profile.phone.length > 0 && profile.phone.length < 11 && (
                      <p className="mt-1 text-sm text-gray-500 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1 text-gray-400" />
                        {profile.phone.length}/11 digits
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaBriefcase className="inline h-4 w-4 mr-2 text-gray-500" />
                      Position/Title
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profile.position || ""} 
                        onChange={(e) => setProfile({...profile, position: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="e.g., RHU Health Officer"
                      />
                      <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Professional Details</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Department/Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaHospital className="inline h-4 w-4 mr-2 text-gray-500" />
                      Department/Unit
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profile.department || ""} 
                        onChange={(e) => setProfile({...profile, department: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="e.g., Health Services Department"
                      />
                      <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Facility Information Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Health Facility Information</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* RHU Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaHospital className="inline h-4 w-4 mr-2 text-gray-500" />
                      RHU/Health Facility Name
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profile.rhu_name || ""} 
                        onChange={(e) => setProfile({...profile, rhu_name: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="e.g., Rural Health Unit - Barangay Centro"
                      />
                      <FaHospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  {/* RHU Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline h-4 w-4 mr-2 text-gray-500" />
                      Facility Address
                    </label>
                    <div className="relative">
                      <textarea 
                        value={profile.rhu_address || ""} 
                        onChange={(e) => setProfile({...profile, rhu_address: e.target.value})} 
                        rows="3"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Enter complete address of the health facility"
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Reset to original values
                  fetchProfile();
                  setProfileErrors({});
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Validate and save profile
                  const errors = {};
                  if (!profile.full_name) errors.full_name = "Full name is required";
                  if (!profile.email) {
                    errors.email = "Email is required";
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
                    errors.email = "Please enter a valid email address";
                  } else if (profile.email.length > 100) {
                    errors.email = "Email is too long (max 100 characters)";
                  }
                  if (!profile.phone) {
                    errors.phone = "Phone number is required";
                  } else if (profile.phone.length !== 11) {
                    errors.phone = "Phone number must be exactly 11 digits";
                  } else if (!/^09\d{9}$/.test(profile.phone)) {
                    errors.phone = "Phone number must start with 09";
                  }
                  
                  setProfileErrors(errors);
                  
                  if (Object.keys(errors).length === 0) {
                    setProfileSaving(true);
                    try {
                      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/update_admin_profile.php`, profile, {
                        withCredentials: true
                      });
                      setToast({ message: "Profile updated successfully!", type: "success" });
                      setTimeout(() => setToast({ message: "", type: "success" }), 3000);
                    } catch (error) {
                      setToast({ message: "Failed to update profile. Please try again.", type: "error" });
                      setTimeout(() => setToast({ message: "", type: "error" }), 3000);
                    } finally {
                      setProfileSaving(false);
                    }
                  }
                }}
                disabled={profileSaving}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {profileSaving ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
          )}
        </div>
      )}

      {activeTab === 'account' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUser className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-600">Manage your account credentials and security</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Username Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Profile Information</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline h-4 w-4 mr-2 text-gray-500" />
              Username
            </label>
                <div className="relative">
                  <input 
                    value={account.username || ""} 
                    onChange={(e)=>setAccount({...account, username: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
                    placeholder="Enter your username"
                  />
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Security Settings</h4>
              </div>
              <form className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaShieldAlt className="inline h-4 w-4 mr-2 text-gray-500" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={account.old_password || ""} 
                      onChange={(e) => handlePasswordChange("old_password", e.target.value)} 
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                        passwordErrors.old_password 
                          ? "border-red-300 focus:ring-red-500" 
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Enter your current password"
                    />
                    <FaShieldAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {passwordErrors.old_password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FaExclamationTriangle className="h-4 w-4 mr-1" />
                      {passwordErrors.old_password}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaKey className="inline h-4 w-4 mr-2 text-gray-500" />
                      New Password
                    </label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={account.new_password || ""} 
                        onChange={(e) => handlePasswordChange("new_password", e.target.value)} 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                          passwordErrors.new_password 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Enter new password"
                      />
                      <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    {passwordErrors.new_password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1" />
                        {passwordErrors.new_password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCheckCircle className="inline h-4 w-4 mr-2 text-gray-500" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={account.confirm_password || ""} 
                        onChange={(e) => handlePasswordChange("confirm_password", e.target.value)} 
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                          account.confirm_password && !passwordMatch
                            ? "border-red-300 focus:ring-red-500" 
                            : passwordMatch
                            ? "border-green-300 focus:ring-green-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Confirm new password"
                      />
                      <FaCheckCircle className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        passwordMatch ? "text-green-500" : "text-gray-400"
                      }`} />
                      {account.confirm_password && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {passwordMatch ? (
                            <FaCheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {account.confirm_password && !passwordMatch && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 mr-1" />
                        Passwords do not match
                      </p>
                    )}
                    {passwordMatch && (
                      <p className="mt-1 text-sm text-green-600 flex items-center">
                        <FaCheckCircle className="h-4 w-4 mr-1" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>


            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FaShieldAlt className="h-4 w-4" />
                <span>Your password should be at least 8 characters long</span>
          </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setAccount({ ...account, old_password: '', new_password: '', confirm_password: '' });
                    setPasswordErrors({ old_password: "", new_password: "", confirm_password: "" });
                    setPasswordMatch(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Cancel
                </button>
            <button
              onClick={async ()=>{
                // Validate all fields before submission
                const hasErrors = Object.values(passwordErrors).some(error => error !== "");
                if (hasErrors || !passwordMatch || !account.old_password || !account.new_password || !account.confirm_password) {
                  showToast('Please fix all validation errors before submitting', 'error');
                  return;
                }
                
                try {
                  const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/change_password.php`, {
                    username: account.username,
                    old_password: account.old_password,
                    new_password: account.new_password,
                  });
                  if (res.data.success) {
                    showToast('Password changed successfully', 'success');
                    setAccount({ ...account, old_password: '', new_password: '', confirm_password: '' });
                    setPasswordErrors({ old_password: "", new_password: "", confirm_password: "" });
                    setPasswordMatch(false);
                  } else {
                    showToast(res.data.message || 'Failed to change password', 'error');
                  }
                } catch(e){ showToast('Server error', 'error'); }
              }}
              disabled={!passwordMatch || Object.values(passwordErrors).some(error => error !== "") || !account.old_password || !account.new_password || !account.confirm_password}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheckCircle className="h-4 w-4 mr-2" />
              Update Password
            </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6">
          {/* Security Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-600">Manage session timeouts and security policies</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Session Timeout Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Session Security</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaClock className="inline h-4 w-4 mr-2 text-gray-500" />
                      Session Timeout (minutes)
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={settings.session_timeout_minutes || 30}
                        onChange={(e) => setSettings({...settings, session_timeout_minutes: parseInt(e.target.value)})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        min="5"
                        max="480"
                        placeholder="30"
                      />
                      <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Auto-logout after inactivity (5-480 minutes)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaExclamationTriangle className="inline h-4 w-4 mr-2 text-gray-500" />
                      Warning Time (minutes)
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={settings.session_warning_minutes || 5}
                        onChange={(e) => setSettings({...settings, session_warning_minutes: parseInt(e.target.value)})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        min="1"
                        max="30"
                        placeholder="5"
                      />
                      <FaExclamationTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Show warning before logout (1-30 minutes)</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <FaShieldAlt className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Security Note</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Session timeout protects sensitive health data by automatically logging out inactive users.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={updateSettings}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg transition-all duration-200"
                  >
                    <FaCheckCircle className="h-4 w-4 mr-2" />
                    Save Session Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Security Information</h4>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FaShieldAlt className="h-6 w-6 text-green-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Automatic Logout</h5>
                    <p className="text-xs text-gray-600 mt-1">Users are automatically logged out after inactivity</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FaExclamationTriangle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Warning System</h5>
                    <p className="text-xs text-gray-600 mt-1">Users receive warnings before session expires</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FaClock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h5 className="font-medium text-gray-900">Configurable</h5>
                    <p className="text-xs text-gray-600 mt-1">Administrators can adjust timeout settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6">
          {/* Enhanced Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                  <p className="text-sm text-gray-600">Monitor user activities and system events</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-sm font-medium text-blue-600">{filteredActivityLogs.length} Activities</span>
                </div>
                
              </div>
            </div>
          </div>

          {/* Modern Search and Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              {/* Modern Search Input */}
              <SearchInput
                placeholder="Search activity logs..."
                value={activitySearchTerm}
                onChange={handleActivitySearch}
                className="w-80"
              />

              {/* Modern Sort Control */}
              <SortControl
                value={activitySortBy}
                order={activitySortOrder}
                options={activitySortOptions}
                onChange={handleActivitySort}
                onToggleOrder={handleActivitySortOrderToggle}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" key={`activity-${activitySortBy}-${activitySortOrder}`}>
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaClock className="h-3 w-3" />
                    <span>Timestamp</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaUser className="h-3 w-3" />
                    <span>User</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaShieldAlt className="h-3 w-3" />
                    <span>Activity</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaFileAlt className="h-3 w-3" />
                    <span>Description</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="h-3 w-3" />
                    <span>IP Address</span>
                  </div>
                </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <FaClock className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity logs found</h3>
                          <p className="text-sm text-gray-500">User activities will appear here when they occur</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredActivityLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaClock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(log.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleTimeString('en-US', { 
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {log.username ? log.username.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.username || 'Unknown'}</div>
                            <div className="text-xs text-gray-500 capitalize">{log.user_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                            {log.activity_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <FaFileAlt className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{log.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                            {log.ip_address || 'Unknown'}
                          </code>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {activityTotalPages > 1 && (
            <Pagination
              currentPage={activityCurrentPage}
              totalPages={activityTotalPages}
              onPageChange={handleActivityPageChange}
              itemsPerPage={activityItemsPerPage}
              totalItems={activityTotalRecords}
              showPageSizeSelector={true}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          )}
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6">
          {/* Enhanced Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaDatabase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Database Backup & Restore</h3>
                  <p className="text-sm text-gray-600">Create, restore, and manage database backups</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-sm font-medium text-blue-600">{Array.isArray(backupFiles) ? backupFiles.length : 0} Backups</span>
                </div>
                {(databaseSize || globalBackupState.databaseSize) && (
                  <div className="bg-white px-3 py-1 rounded-full border border-green-200">
                    <span className="text-sm font-medium text-green-600">
                      {((databaseSize || globalBackupState.databaseSize) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Database Info Card */}
            {(databaseSize || globalBackupState.databaseSize) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaDatabase className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">Database Size</div>
                    <div className="text-lg font-semibold text-blue-700">
                      {((databaseSize || globalBackupState.databaseSize) / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Backup Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Backup Operations</h4>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={createBackup}
                    disabled={globalBackupState.isRunning && globalBackupState.currentAction === 'create'}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {globalBackupState.isRunning && globalBackupState.currentAction === 'create' ? (
                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FaDatabase className="w-4 h-4 mr-2" />
                    )}
                    Create Backup
                  </button>
                  
                  {globalBackupState.canCancel && (
                    <button
                      onClick={cancelBackup}
                      className="inline-flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg transition-all duration-200"
                    >
                      <FaExclamationTriangle className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  )}
                </div>
                
                {/* Enhanced Progress Indicator */}
                {globalBackupState.isRunning && globalBackupState.currentAction === 'create' && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FaSpinner className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-gray-700">Creating backup...</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{Math.round(globalBackupState.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${globalBackupState.progress}%` }}
                      ></div>
                    </div>
                    {globalBackupState.estimatedTime && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaClock className="w-4 h-4" />
                        <span>Estimated time: {globalBackupState.estimatedTime}</span>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      This may take a few minutes for large databases. You can navigate to other pages while backup is running.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Backup Files Table */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h4 className="text-md font-semibold text-gray-900">Backup Files</h4>
              </div>
              
              <div className="overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm pb-4" style={{ maxHeight: '600px', minHeight: '300px' }}>
                <table className="min-w-full divide-y divide-gray-200 overflow-visible">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <FaDatabase className="h-3 w-3" />
                          <span>Filename</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <FaDownload className="h-3 w-3" />
                          <span>Size</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <FaClock className="h-3 w-3" />
                          <span>Created</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <FaEllipsisV className="h-3 w-3" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(!backupFiles || !Array.isArray(backupFiles) || backupFiles.length === 0) ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <FaDatabase className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No backup files found</h3>
                              <p className="text-sm text-gray-500 mb-4">Create your first backup to get started</p>
                              <button
                                onClick={createBackup}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all duration-200"
                              >
                                <FaDatabase className="h-4 w-4 mr-2" />
                                Create First Backup
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (Array.isArray(backupFiles) ? backupFiles : []).map((file, index) => (
                        <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group overflow-visible">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaDatabase className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                                <div className="text-xs text-gray-500">SQL Backup File</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <FaDownload className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <FaClock className="h-4 w-4 text-gray-400" />
                              <span>{new Date(file.created).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="relative backup-menu-container">
                              <button
                                onClick={() => toggleBackupMenu(file.filename)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                disabled={globalBackupState.isRunning}
                                title="More options"
                              >
                                <FaEllipsisV className="w-4 h-4" />
                              </button>
                              
                              {activeBackupMenu === file.filename && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] transform -translate-x-2">
                                  {/* Arrow pointing to kebab menu */}
                                  <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Temporarily disabled for beta testing
                                        setActiveBackupMenu(null);
                                        showToast('Restore feature is temporarily disabled for beta testing', 'info');
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-400 bg-gray-50 cursor-not-allowed transition-all duration-200 flex items-center opacity-60"
                                      title="Restore is temporarily disabled for beta testing"
                                    >
                                      <FaCheckCircle className="w-4 h-4 mr-3 text-gray-400" />
                                      Restore Backup
                                    </button>
                                    <button
                                      onClick={() => {
                                        downloadBackup(file.filename);
                                        setActiveBackupMenu(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center focus:outline-none focus:bg-blue-50"
                                      title="Download this backup"
                                    >
                                      <FaDownload className="w-4 h-4 mr-3 text-blue-500" />
                                      Download Backup
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleBackupAction('delete', file.filename);
                                        setActiveBackupMenu(null);
                                      }}
                                      disabled={globalBackupState.isRunning}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center focus:outline-none focus:bg-red-50"
                                      title="Delete this backup"
                                    >
                                      <FaTrash className="w-4 h-4 mr-3 text-red-500" />
                                      Delete Backup
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6 min-h-[600px] pb-8">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaInfoCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">About PRMS</h3>
                <p className="text-sm text-gray-600">Patient Record System with Tracking and ARIMA-Based Forecasting</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* System Overview */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaHospital className="text-blue-600" />
                System Overview
              </h4>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Patient Record System with Tracking and ARIMA-Based Forecasting for Top 5 Communicable Diseases </strong> 
                  is an advanced web-based application designed for managing patient records, tracking communicable diseases, 
                  and generating forecasts using ARIMA (AutoRegressive Integrated Moving Average) models.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This system focuses on the top 5 communicable diseases and enables healthcare administrators and staff 
                  to efficiently manage patient data, monitor disease trends with geographical tracking, and make data-driven 
                  decisions through predictive analytics and forecasting.
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCode className="text-green-600" />
                Key Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h5 className="font-semibold text-green-900 mb-2">👥 Patient Management</h5>
                  <p className="text-sm text-gray-700">Comprehensive patient records with demographic and medical information</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h5 className="font-semibold text-purple-900 mb-2">📊 Disease Tracking</h5>
                  <p className="text-sm text-gray-700">Real-time disease monitoring with geographical heatmap visualization</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h5 className="font-semibold text-orange-900 mb-2">🔮 ARIMA Forecasting</h5>
                  <p className="text-sm text-gray-700">Statistical time series forecasting for proactive healthcare planning</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <h5 className="font-semibold text-red-900 mb-2">📈 Analytics & Reports</h5>
                  <p className="text-sm text-gray-700">Comprehensive reports with charts and data visualization</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h5 className="font-semibold text-indigo-900 mb-2">🔒 Security & Audit</h5>
                  <p className="text-sm text-gray-700">Role-based access control and complete audit logging</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                  <h5 className="font-semibold text-teal-900 mb-2">💾 Backup & Restore</h5>
                  <p className="text-sm text-gray-700">Automated database backup and restore functionality</p>
                </div>
              </div>
            </div>

            {/* Developer Information */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Developer Information
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-2 font-medium">Developers</div>
                    <div className="text-lg font-semibold text-gray-900">Ariel Longa, Mark Brian Navarro & Team</div>
                    <div className="text-sm text-gray-500 mt-1">Capstone Project Developers</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2 font-medium">Institution</div>
                    <div className="text-lg font-semibold text-gray-900">Laguna State Polytechnic University - Los Baños Campus</div>
                    <div className="text-sm text-gray-500 mt-1">Educational Institution</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2 font-medium">Academic Year</div>
                    <div className="text-lg font-semibold text-gray-900">2025-2026</div>
                    <div className="text-sm text-gray-500 mt-1">School Year</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2 font-medium">Program/Course</div>
                    <div className="text-lg font-semibold text-gray-900">BS Information Technology</div>
                    <div className="text-sm text-gray-500 mt-1">Degree Program</div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaServer className="text-gray-600" />
                System Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Version</div>
                    <div className="text-lg font-semibold text-gray-900">1.0.0</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Release Date</div>
                    <div className="text-lg font-semibold text-gray-900">{new Date().getFullYear()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Project Information</h4>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                <p className="text-gray-700 leading-relaxed mb-3">
                  This system is developed as a <strong>Capstone Project</strong> for academic purposes, 
                  demonstrating advanced web development, database management, and statistical forecasting integration.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  The application follows modern software engineering practices including RESTful API design, 
                  secure authentication, role-based access control, and comprehensive audit logging.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}


      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
        userData={selectedUser}
      />
      
      {toast.message && (
        <ModernToast
          isVisible={true}
          message={toast.message}
          type={toast.type}
          title="Settings Updated"
          duration={4000}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      )}

      {confirmModal.show && (
        <ConfirmationModal
          message="Are you sure you want to delete this user?"
          onConfirm={handleConfirmedDelete}
          onCancel={() => setConfirmModal({ show: false, userId: null })}
        />
      )}

      {backupConfirmModal.show && (
        <ConfirmationModal
          message={
            backupConfirmModal.action === 'restore' 
              ? `Are you sure you want to restore the database from "${backupConfirmModal.file}"? This will overwrite all current data.`
              : `Are you sure you want to delete the backup file "${backupConfirmModal.file}"?`
          }
          onConfirm={confirmBackupAction}
          onCancel={() => {
            console.log('Modal cancelled');
            setBackupConfirmModal({ show: false, action: '', file: null });
          }}
        />
      )}

      {profileModalOpen && selectedUserProfile && (
        <UserProfileModal
          user={selectedUserProfile}
          onClose={handleCloseProfileModal}
        />
      )}
    </motion.div>
    
  );
}

export default Settings;

