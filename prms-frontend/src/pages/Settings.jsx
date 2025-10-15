import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCog, FaEdit, FaTrash, FaClock, FaUser, FaShieldAlt, FaEllipsisV } from "react-icons/fa";
import SettingsToolbar from "../components/SettingsToolbar";
import UserModal from "../components/AddUser";
import Toast from "../components/Toast";
import ConfirmationModal from "../components/ConfirmationModal";
import Pagination from "../components/Pagination";

import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("users"); // users | account | activity
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


  const showToast = (message, type = "success") => {
    setToast({ message, type });
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

  const filteredUsers = [...users]
    .filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toString().includes(search)
    )
    .sort((a, b) => {
      const aVal = a[sortKey]?.toString().toLowerCase();
      const bVal = b[sortKey]?.toString().toLowerCase();
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

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
      <div className="flex items-center justify-start gap-2 mb-4">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab==='users' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
          <FaUser className="inline mr-2" />
          Users
        </button>
        <button onClick={() => setActiveTab('account')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab==='account' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
          <FaCog className="inline mr-2" />
          Account
        </button>
        <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab==='activity' ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
          <FaClock className="inline mr-2" />
          Activity Logs
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="mt-4 mb-4">
          <SettingsToolbar
            onSearch={setSearch}
            onSort={setSortKey}
            sortOrder={sortOrder}
            onToggleSortOrder={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            onAdd={handleOpenAddModal}
            disableAdd={false}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{u.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{u.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.created_at}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
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
                  <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Clinic tab removed */}

      {activeTab === 'account' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              Username
              <input value={account.username} onChange={(e)=>setAccount({...account, username: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <div />
            <label className="text-sm text-gray-700">
              Old Password
              <input type="password" value={account.old_password} onChange={(e)=>setAccount({...account, old_password: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="text-sm text-gray-700">
              New Password
              <input type="password" value={account.new_password} onChange={(e)=>setAccount({...account, new_password: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Confirm New Password
              <input type="password" value={account.confirm_password} onChange={(e)=>setAccount({...account, confirm_password: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={async ()=>{
                if (!account.new_password || account.new_password !== account.confirm_password) {
                  showToast('Passwords do not match', 'error');
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
                  } else {
                    showToast(res.data.message || 'Failed to change password', 'error');
                  }
                } catch(e){ showToast('Server error', 'error'); }
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
            >Change Password</button>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
            <p className="text-sm text-gray-500">Monitor user activities and system events</p>
          </div>
          
          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search activity logs..."
                value={activitySearchTerm}
                onChange={(e) => handleActivitySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClock className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900">No activity logs found</p>
                        <p className="text-sm text-gray-500">User activities will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.username || 'Unknown'}</div>
                            <div className="text-sm text-gray-500 capitalize">{log.user_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {log.activity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.ip_address || 'Unknown'}
                        </code>
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
    </div>
    
  );
}

export default Settings;
