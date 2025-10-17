import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCog, FaEdit, FaTrash, FaClock, FaUser, FaShieldAlt, FaEllipsisV, FaDatabase, FaDownload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaKey, FaFileAlt, FaMapMarkerAlt } from "react-icons/fa";
import SettingsToolbar from "../components/SettingsToolbar";
import UserModal from "../components/AddUser";
import Toast from "../components/Toast";
import ConfirmationModal from "../components/ConfirmationModal";
import Pagination from "../components/Pagination";
import { useBackup } from "../contexts/BackupContext";

import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("users"); // users | account | activity | backup
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

  // Account change password state
  const [account, setAccount] = useState({
    username: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Password validation state
  const [passwordErrors, setPasswordErrors] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(false);

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
  };

  const toggleBackupMenu = (filename) => {
    setActiveBackupMenu(activeBackupMenu === filename ? null : filename);
  };

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
    const res = await axios.get("http://localhost/prms/prms-backend/get_users.php");
    if (res.data.success) setUsers(res.data.users);
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

      const response = await axios.get(`http://localhost/prms/prms-backend/get_activity_logs.php?${params}`);
      
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
    const res = await axios.post("http://localhost/prms/prms-backend/delete_user.php", { id });
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
      default:
        break;
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
      ? "http://localhost/prms/prms-backend/update_user.php"
      : "http://localhost/prms/prms-backend/add_user.php";

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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">

      {/* Modern Header with Controls */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
            <p className="text-gray-700 mt-2">Manage users, and your account</p>
          </div>
        </div>
      </div>

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
          </nav>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-6">
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

          {/* Search and Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-80">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="id">Sort by ID</option>
                  <option value="username">Sort by Username</option>
                  <option value="created_at">Sort by Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white text-sm font-medium"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                <tr key={u.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
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
                  <td className="px-6 py-4 text-sm text-gray-700">
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
                  const res = await axios.post('http://localhost/prms/prms-backend/change_password.php', {
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

          {/* Search and Filter Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-80">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search activity logs..."
                    value={activitySearchTerm}
                    onChange={(e) => handleActivitySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={activitySortBy}
                  onChange={(e) => setActivitySortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="created_at">Sort by Date</option>
                  <option value="username">Sort by User</option>
                  <option value="activity_type">Sort by Activity</option>
                </select>
                <button
                  onClick={() => setActivitySortOrder(activitySortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  title={`Sort ${activitySortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <FaClock className={`h-4 w-4 ${activitySortOrder === 'asc' ? 'rotate-180' : ''} transition-transform duration-200`} />
                </button>
              </div>
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
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
              
              <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
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
                                      onClick={() => {
                                        handleBackupAction('restore', file.filename);
                                        setActiveBackupMenu(null);
                                      }}
                                      disabled={globalBackupState.isRunning}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center focus:outline-none focus:bg-green-50"
                                      title="Restore this backup"
                                    >
                                      <FaCheckCircle className="w-4 h-4 mr-3 text-green-500" />
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


      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
        userData={selectedUser}
      />
      
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
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
    </div>
    
  );
}

export default Settings;
