import React, { useState, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import ConfirmationModal from '../../components/ConfirmationModal';
import LogoutAnimationModal from '../../components/LogoutAnimationModal';
import DateTimeDisplay from '../../components/DateTimeDisplay';
import StaffNotificationBell from './StaffNotificationBell';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api/axios';

const StaffTopBar = ({ sidebarCollapsed = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [logoutStage, setLogoutStage] = useState('loading');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Check if we're on staff dashboard
  const isOnDashboard = location.pathname === '/staff/dashboard';

  // Fetch current user ID for notifications
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/me.php`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUserId(data.user.id);
        }
      } catch (err) {
        console.error("Error fetching current user for notifications:", err);
      }
    };
    
    // Add delay to allow session to be established after login
    const timer = setTimeout(() => {
      fetchCurrentUser();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Global search function
  const handleGlobalSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Search across multiple endpoints using staff API
      const [patientsRes, diseasesRes] = await Promise.all([
        api.get(`/patients.php?q=${encodeURIComponent(query)}&limit=5`),
        api.get('/get_diseases.php')
      ]);

      const patientsData = patientsRes.data;
      const diseasesData = diseasesRes.data;

      // Filter diseases by search query
      const filteredDiseases = (diseasesData.data || [])
        .filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      setSearchResults({
        patients: patientsData.data || [],
        diseases: filteredDiseases
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ patients: [], diseases: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleGlobalSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Navigate to result
  const navigateToPatient = () => {
    navigate('/staff/patients');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const navigateToDisease = () => {
    navigate('/staff/diseases');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    console.log('Staff logout initiated - showing animation');
    setShowModal(false);
    
    setTimeout(async () => {
      console.log('Setting logout animation to true');
      setShowLogoutAnimation(true);
      setLogoutStage('loading');
      
      // Call backend logout endpoint
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout.php`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      // Show success animation
      setTimeout(() => {
        console.log('Logout stage: success');
        setLogoutStage('success');
        
        // Complete logout after success animation
        setTimeout(() => {
          console.log('Completing staff logout process');
          // Clear staff-specific session data
          sessionStorage.removeItem("isLoggedIn");
          localStorage.removeItem("staff_token");
          localStorage.removeItem("staff_role");
          localStorage.removeItem("sidebarCollapsed");
          
          // Dispatch logout event for cleanup
          window.dispatchEvent(new CustomEvent('logout'));
          
          // Navigate to login page
          navigate("/", { replace: true });
          window.location.reload();
        }, 2000);
      }, 1500);
    }, 100);
  };

  return (
    <>
      {/* Desktop TopBar */}
      <div className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-200 z-50 hidden lg:block">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wider">PRMS</h1>
            </div>
          </div>

          {/* CENTER - Global Search (Dashboard Only) */}
          {isOnDashboard && (
            <div className="flex-1 max-w-2xl mx-8 relative">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients, diseases, or medical records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  {/* Patients Results */}
                  {searchResults.patients.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Patients</div>
                      {searchResults.patients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={navigateToPatient}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <div className="font-medium text-gray-900">{patient.full_name}</div>
                          <div className="text-sm text-gray-500">ID: {patient.id} • {patient.age} years • {patient.barangay}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Diseases Results */}
                  {searchResults.diseases.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Diseases</div>
                      {searchResults.diseases.map((disease) => (
                        <button
                          key={disease.id}
                          onClick={navigateToDisease}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <div className="font-medium text-gray-900">{disease.name}</div>
                          <div className="text-sm text-gray-500">{disease.description}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchResults.patients.length === 0 && searchResults.diseases.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right side - Date/Time and User actions */}
          <div className="flex items-center space-x-4">
            {/* Date and Time Display */}
            <DateTimeDisplay />
            
            {/* Notification Bell */}
            {currentUserId && <StaffNotificationBell userId={currentUserId} />}
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Settings */}
              <button
                onClick={() => navigate('/staff/settings')}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Settings"
              >
                <FaCog className="w-5 h-5" />
              </button>

              {/* Logout */}
              <button
                onClick={() => setShowModal(true)}
                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile TopBar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40 lg:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-gray-900">Staff Portal</h2>
              <p className="text-gray-600 text-xs">PRMS</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <DateTimeDisplay />
            {currentUserId && <StaffNotificationBell userId={currentUserId} />}
            <button
              onClick={() => navigate('/staff/settings')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Settings"
            >
              <FaCog className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <FaSignOutAlt className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
          title="Confirm logout"
          message="Are you sure you want to log out?"
          confirmLabel="Logout"
          cancelLabel="Cancel"
          onConfirm={handleLogout}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* Logout Animation Modal */}
      <LogoutAnimationModal 
        isVisible={showLogoutAnimation} 
        stage={logoutStage} 
      />
    </>
  );
};

export default StaffTopBar;


