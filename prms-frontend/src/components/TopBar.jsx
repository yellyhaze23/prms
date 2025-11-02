import React, { useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaQuestionCircle, FaSearch } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import BackupStatusIndicator from './BackupStatusIndicator';
import ConfirmationModal from './ConfirmationModal';
import DateTimeDisplay from './DateTimeDisplay';
import LogoutAnimationModal from './LogoutAnimationModal';
import HelpModal from './HelpModal';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopBar = ({ userId = 1, userName = "User", userRole = "Guest", sidebarCollapsed }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [logoutStage, setLogoutStage] = useState('loading');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Check if we're on dashboard
  const isOnDashboard = location.pathname === '/';

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
      // Use relative URL for dev server, full URL for production
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/prms-backend';
      
      // Search across multiple endpoints
      const [patientsRes, diseasesRes] = await Promise.all([
        fetch(`${apiBase}/get_patients.php?search=${encodeURIComponent(query)}&limit=5`, {
          credentials: 'include'
        }),
        fetch(`${apiBase}/get_diseases.php`, {
          credentials: 'include'
        })
      ]);

      // Check if responses are OK before parsing
      if (!patientsRes.ok || !diseasesRes.ok) {
        throw new Error(`HTTP error! status: ${patientsRes.status || diseasesRes.status}`);
      }

      const patientsData = await patientsRes.json();
      const diseasesData = await diseasesRes.json();

      // Filter diseases by search query
      // get_diseases.php returns array directly, not wrapped in {data: [...]}
      const diseasesArray = Array.isArray(diseasesData) ? diseasesData : (diseasesData.data || []);
      const filteredDiseases = diseasesArray
        .filter(d => d.name && d.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      setSearchResults({
        patients: (patientsData.success ? patientsData.data : []) || [],
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
    navigate(`/patient`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const navigateToDisease = () => {
    navigate('/diseases');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    console.log('Logout initiated - showing animation');
    setShowModal(false);
    
    // Use setTimeout to ensure state updates are applied
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
          console.log('Completing logout process');
          sessionStorage.removeItem("isLoggedIn");
          localStorage.removeItem("sidebarCollapsed");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          
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
              <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wider">PRSTF</h1>
            </div>
          </div>

          {/* CENTER - Global Search (Dashboard Only) */}
          {isOnDashboard && (
            <div className="flex-1 max-w-xl mx-8 relative">
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
            {/* Backup Status Indicator */}
            <BackupStatusIndicator />
            {/* Date and Time Display */}
            <DateTimeDisplay />
            {/* Notification Bell */}
            <NotificationBell userId={userId} />
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Help */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Help & Documentation"
              >
                <FaQuestionCircle className="w-5 h-5" />
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate('/settings')}
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
              <span className="text-white font-bold text-sm">Tracely</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-gray-900">PRMS</h2>
              <p className="text-gray-600 text-xs">Health Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <BackupStatusIndicator />
            <DateTimeDisplay />
            <NotificationBell userId={userId} />
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Help & Documentation"
            >
              <FaQuestionCircle className="w-5 h-5" />
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

      {/* Help Modal */}
      <HelpModal 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />
    </>
  );
};

export default TopBar;

