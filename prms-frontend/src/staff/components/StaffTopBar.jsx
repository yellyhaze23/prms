import React, { useState, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
import ConfirmationModal from '../../components/ConfirmationModal';
import LogoutAnimationModal from '../../components/LogoutAnimationModal';
import DateTimeDisplay from '../../components/DateTimeDisplay';
import StaffNotificationBell from './StaffNotificationBell';
import { useNavigate } from 'react-router-dom';

const StaffTopBar = ({ onToggleSidebar, sidebarCollapsed = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [logoutStage, setLogoutStage] = useState('loading');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

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
      <div className={`fixed top-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40 hidden lg:block transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Toggle button and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FaBars className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Staff Portal</h2>
          </div>

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


