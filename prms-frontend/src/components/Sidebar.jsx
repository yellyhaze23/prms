import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaRegFileAlt,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaMapMarkerAlt,
  FaChartBar,
  FaChevronRight,
  FaChartLine,
  FaStethoscope,
  FaShieldAlt, // Added FaShieldAlt icon for Audit Logs
} from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";
import LogoutAnimationModal from "./LogoutAnimationModal";
import { preloadRoute } from '../utils/routePreloader';

function Sidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [showModal, setShowModal] = useState(false);
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [logoutStage, setLogoutStage] = useState('loading');

  const handleLogout = () => {
    console.log('Sidebar logout initiated - showing animation');
    setShowModal(false);
    
    // Use setTimeout to ensure state updates are applied
    setTimeout(() => {
      console.log('Setting sidebar logout animation to true');
      setShowLogoutAnimation(true);
      setLogoutStage('loading');
      
      // Simulate logout process
      setTimeout(() => {
        console.log('Sidebar logout stage: success');
        setLogoutStage('success');
        
        // Complete logout after success animation
        setTimeout(() => {
          console.log('Completing sidebar logout process');
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

  const handleNavClick = (path) => {
    // Preload the target route for instant switching
    preloadRoute(path);
  };

  const handleNavHover = (path) => {
    // Preload on hover for even faster switching
    preloadRoute(path);
  };

      const navItems = [
        { path: "/", icon: FaTachometerAlt, label: "Dashboard" },
        { path: "/patient", icon: FaUser, label: "Patient" },
        { path: "/records", icon: FaRegFileAlt, label: "Medical Records" },
        { path: "/diseases", icon: FaStethoscope, label: "Diseases" },
        { path: "/tracker", icon: FaMapMarkerAlt, label: "Tracker" },
        { path: "/arima-forecast", icon: FaChartLine, label: "Forecast" },
        { path: "/reports", icon: FaChartBar, label: "Reports" },
        { path: "/audit-logs", icon: FaShieldAlt, label: "Audit Logs" },
        { path: "/settings", icon: FaCog, label: "Settings" },
      ];

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 z-50 hidden lg:block transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Header Section */}
        <div className={`border-b border-slate-700/50 ${collapsed ? 'p-4' : 'p-6'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ${collapsed ? 'w-8 h-8' : 'w-12 h-12'}`}>
              <FaChartLine className={`text-white ${collapsed ? 'text-sm' : 'text-xl'}`} />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-white font-bold text-lg">Tracely</h1>
                <p className="text-slate-400 text-xs">Track disease easily</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className={`flex-1 py-6 space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                onMouseEnter={() => handleNavHover(item.path)}
                className={`group flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                } ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon 
                  className={`text-lg transition-transform duration-200 ${
                    collapsed ? '' : 'mr-3'
                  } ${
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`} 
                />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <FaChevronRight className="text-white text-xs opacity-70" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className={`border-t border-slate-700/50 ${collapsed ? 'p-2' : 'p-4'}`}>
          <button
            onClick={() => setShowModal(true)}
            className={`w-full flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 group ${
              collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
            }`}
            title={collapsed ? 'Logout' : ''}
          >
            <FaSignOutAlt className={`text-lg text-slate-400 group-hover:text-red-400 transition-colors duration-200 ${
              collapsed ? '' : 'mr-3'
            }`} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

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
}

export default Sidebar;
