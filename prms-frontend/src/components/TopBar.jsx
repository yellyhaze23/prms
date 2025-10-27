import React, { useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaBars, FaQuestionCircle } from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import BackupStatusIndicator from './BackupStatusIndicator';
import ConfirmationModal from './ConfirmationModal';
import DateTimeDisplay from './DateTimeDisplay';
import LogoutAnimationModal from './LogoutAnimationModal';
import HelpModal from './HelpModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ userId = 1, userName = "User", userRole = "Guest", onToggleSidebar, sidebarCollapsed }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [logoutStage, setLogoutStage] = useState('loading');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const navigate = useNavigate();


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
        await fetch('http://localhost/prms-backend/logout.php', {
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
      <div className={`fixed top-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40 hidden lg:block transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Toggle button */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>

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

