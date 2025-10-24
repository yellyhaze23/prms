import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaClock, FaUser, FaShieldAlt, FaFileAlt, FaMapMarkerAlt, FaCheckCircle, FaTimes, FaExclamationTriangle, FaSpinner, FaIdCard, FaEnvelope, FaPhone, FaSyncAlt } from 'react-icons/fa';
import api from '../../lib/api/axios';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import SortControl from '../../components/SortControl';
import FilterControl from '../../components/FilterControl';
import AuditLogDetailsModal from '../../components/AuditLogDetailsModal';
import ModernToast from '../../components/ModernToast';

// Animation variants
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function StaffSettings() {
  const [activeTab, setActiveTab] = useState('profile'); // profile | activity | session
  const [profile, setProfile] = useState({ username: '', name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: 'success' });
  
  // Session state
  const [sessionSettings, setSessionSettings] = useState({
    session_timeout_minutes: 30,
    session_warning_minutes: 5
  });
  const [sessionLoading, setSessionLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Activity logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    date_from: '',
    date_to: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search and sort state for activity logs
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activitySortBy, setActivitySortBy] = useState('created_at');
  const [activitySortOrder, setActivitySortOrder] = useState('desc');

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'view', label: 'View' }
  ];

  const activitySortOptions = [
    { value: 'created_at', label: 'Date' },
    { value: 'action', label: 'Action' }
  ];

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    } else if (activeTab === 'activity') {
      fetchAuditLogs();
    } else if (activeTab === 'session') {
      fetchSessionSettings();
    }
  }, [activeTab, currentPage, itemsPerPage, filters, activitySearchTerm, activitySortBy, activitySortOrder]);

  // Auto-refresh session settings every 30 seconds when on session tab
  useEffect(() => {
    if (activeTab === 'session') {
      const interval = setInterval(() => {
        fetchSessionSettings();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Refresh session settings when window gains focus
  useEffect(() => {
    if (activeTab === 'session') {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchSessionSettings();
        }
      };

      const handleFocus = () => {
        fetchSessionSettings();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      // Fetch username
      const meResponse = await api.get('/me.php');
      const me = meResponse.data?.data || meResponse.data || {};
      setProfile((p) => ({ ...p, username: me.username || p.username }));

      // Fetch profile details
      const profileResponse = await api.get('/profile.php');
      const p = profileResponse.data?.data || profileResponse.data || {};
      setProfile((cur) => ({ ...cur, ...p }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: activitySearchTerm,
        sortBy: activitySortBy,
        sortOrder: activitySortOrder,
        ...filters
      });

      const response = await api.get(`/logs.php?${params}`);

      if (response.data.success) {
        setAuditLogs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionSettings = async () => {
    setSessionLoading(true);
    try {
      const response = await fetch('http://localhost/prms/prms-backend/get_settings.php', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.settings) {
        setSessionSettings({
          session_timeout_minutes: data.settings.session_timeout_minutes || 30,
          session_warning_minutes: data.settings.session_warning_minutes || 5
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching session settings:', error);
      showToast('Failed to load session settings', 'error');
    } finally {
      setSessionLoading(false);
    }
  };

  const saveProfile = async () => {
    // Validate fields
    const errors = {};
    if (!profile.name) errors.name = "Name is required";
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
    
    if (Object.keys(errors).length > 0) {
      showToast('Please fix all validation errors', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile.php', profile);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'success':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <FaTimes className="h-4 w-4 text-red-500" />;
      case 'error':
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FaClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const handlePageChange = (page, newItemsPerPage) => {
    setCurrentPage(page);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    }
  };

  const handleActionFilter = (action) => {
    setFilters(prev => ({ ...prev, action }));
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleActivitySearch = (term) => {
    setActivitySearchTerm(term);
    setCurrentPage(1);
  };

  const handleActivitySort = (field) => {
    setActivitySortBy(field);
    setCurrentPage(1);
  };

  const handleActivitySortOrderToggle = () => {
    setActivitySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  return (
    <motion.div 
      className="space-y-6"
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
            <p className="text-gray-700 mt-2">Manage your preferences and activity</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser className="inline h-4 w-4 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('session')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'session'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaClock className="inline h-4 w-4 mr-2" />
              Session
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShieldAlt className="inline h-4 w-4 mr-2" />
              Activity Logs
            </button>
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FaUser className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-600">Manage your personal information</p>
                </div>
              </div>
              {profile.username && (
                <div className="bg-white/60 backdrop-blur rounded-lg px-4 py-2 border border-indigo-200">
                  <div className="text-xs text-gray-500">Logged in as</div>
                  <div className="font-semibold text-indigo-700 flex items-center gap-2">
                    <FaUser className="h-3 w-3" />
                    {profile.username}
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
            <div className="p-6 space-y-6">
              {/* Username Field */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h4 className="text-md font-semibold text-gray-900">Account Information</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaIdCard className="inline h-4 w-4 mr-2 text-gray-500" />
                      Username
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profile.username || ""} 
                        onChange={(e) => setProfile({...profile, username: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        placeholder="Enter your username"
                      />
                      <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
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
                          value={profile.name || ""} 
                          onChange={(e) => setProfile({...profile, name: e.target.value})} 
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white ${
                            profileErrors.name 
                              ? "border-red-300 focus:ring-red-500" 
                              : "border-gray-300 focus:ring-indigo-500"
                          }`}
                          placeholder="Enter your full name"
                        />
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                      {profileErrors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <FaExclamationTriangle className="h-4 w-4 mr-1" />
                          {profileErrors.name}
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
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    fetchProfile();
                    setProfileErrors({});
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
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

      {/* Session Tab */}
      {activeTab === 'session' && (
        <div className="space-y-6">
          {/* Session Status Card with Last Updated */}
          <motion.div 
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <FaCheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-1">Session Active</h3>
                  <p className="text-sm text-green-700 leading-relaxed">Your session is currently active and being monitored</p>
                  {lastUpdated && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <FaClock className="h-3 w-3 mr-1" />
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Session Settings Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeout Duration Card */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FaClock className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Session Timeout</h4>
                </div>
                <div className="ml-13">
                  <p className="text-4xl font-bold text-blue-600 mb-2">{sessionSettings.session_timeout_minutes} <span className="text-2xl text-gray-500">minutes</span></p>
                  <p className="text-sm text-gray-600 leading-relaxed">Your session will expire after this period of inactivity</p>
                </div>
              </div>
            </motion.div>

            {/* Warning Time Card */}
            <motion.div 
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <FaExclamationTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Warning Time</h4>
                </div>
                <div className="ml-13">
                  <p className="text-4xl font-bold text-amber-600 mb-2">{sessionSettings.session_warning_minutes} <span className="text-2xl text-gray-500">minutes</span></p>
                  <p className="text-sm text-gray-600 leading-relaxed">You'll receive a warning when this much time remains</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Information Card */}
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <FaClock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-blue-900 mb-3">How Session Management Works</h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-start text-sm text-blue-800">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="leading-relaxed">Your session is automatically monitored for activity</span>
                    </li>
                    <li className="flex items-start text-sm text-blue-800">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="leading-relaxed">Any mouse movement, click, or keyboard input extends your session</span>
                    </li>
                    <li className="flex items-start text-sm text-blue-800">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="leading-relaxed">You'll receive a warning before your session expires</span>
                    </li>
                    <li className="flex items-start text-sm text-blue-800">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="leading-relaxed">Session timeout helps protect sensitive health data</span>
                    </li>
                    <li className="flex items-start text-sm text-blue-800">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="leading-relaxed">System administrators manage these timeout settings</span>
                    </li>
                    <li className="flex items-start text-sm text-blue-800">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="leading-relaxed">Settings automatically sync every 30 seconds and when you return to this tab</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Note Card */}
          <motion.div 
            className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FaShieldAlt className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-bold text-gray-900">Note:</span> Session timeout settings are managed system-wide by administrators. 
                    Contact your system administrator if you need to adjust these settings.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {sessionLoading && (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          )}
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          {/* Enhanced Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
                  <p className="text-sm text-gray-600">Monitor your activities and actions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white px-3 py-1 rounded-full border border-blue-200">
                  <span className="text-sm font-medium text-blue-600">{totalRecords} Activities</span>
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

              {/* Modern Action Filter */}
              <FilterControl
                label="Action"
                value={filters.action}
                options={actionOptions}
                onChange={handleActionFilter}
              />

              {/* Date Range Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">From:</span>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">To:</span>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
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
                      <FaShieldAlt className="h-3 w-3" />
                      <span>Action</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaFileAlt className="h-3 w-3" />
                      <span>Entity</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaCheckCircle className="h-3 w-3" />
                      <span>Result</span>
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
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <FaSpinner className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <FaClock className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity logs found</h3>
                          <p className="text-sm text-gray-500">Try adjusting your filters or check back later</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, index) => (
                    <tr 
                      key={index} 
                      onClick={() => handleViewDetails(log)}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group"
                    >
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.entity_type && log.entity_id ? (
                          <span className="text-gray-900">
                            {log.entity_type} #{log.entity_id}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getResultIcon(log.result)}
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getResultColor(log.result)}`}>
                            {log.result}
                          </span>
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
      )}

      {/* Toast */}
      {toast.message && (
        <ModernToast
          isVisible={true}
          message={toast.message}
          type={toast.type}
          title="Settings"
          duration={4000}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Audit Log Details Modal */}
      <AuditLogDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        logData={selectedLog}
      />
    </motion.div>
  );
}
