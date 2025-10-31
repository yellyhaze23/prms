import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaRegFileAlt,
  FaBook,
  FaCog,
  FaUser,
  FaMapMarkerAlt,
  FaChartBar,
  FaChartLine,
  FaStethoscope,
  FaShieldAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { preloadRoute } from '../utils/routePreloader';

function Sidebar({ collapsed = false, onToggle }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleNavClick = (path) => {
    // Preload the target route for instant switching
    preloadRoute(path);
  };

  const handleNavHover = (path) => {
    // Preload on hover for even faster switching
    preloadRoute(path);
  };

  // Fetch current admin user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Only fetch if we're actually in admin mode (not staff)
      const staffToken = localStorage.getItem('staff_token');
      const staffRole = localStorage.getItem('staff_role');
      
      // Don't fetch admin profile if user is staff
      if (staffToken && staffRole === 'staff') {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get_admin_profile.php`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Admin profile response:', data); // Debug log
        if (data.success && data.data) {
          setCurrentUser({
            name: data.data.full_name || data.data.username,
            username: data.data.username,
            role: data.data.role || 'admin'
          });
        }
      } catch (err) {
        console.error("Error fetching admin user:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Add initial delay to prevent race condition on first load
    const initialTimer = setTimeout(() => {
      fetchCurrentUser();
    }, 500);
    
    // Listen for login events to refresh user data
    const handleLogin = () => {
      // Only fetch if we're admin, not staff
      const staffToken = localStorage.getItem('staff_token');
      const staffRole = localStorage.getItem('staff_role');
      
      if (staffToken && staffRole === 'staff') {
        return; // Don't fetch admin profile for staff users
      }
      
      setLoading(true);
      // Add delay to allow session cookie to be established and sent
      setTimeout(() => {
        fetchCurrentUser();
      }, 1500);
    };
    
    window.addEventListener('login', handleLogin);
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('login', handleLogin);
    };
  }, []);

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'A';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
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
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-xl border-r border-gray-200 z-40 hidden lg:flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        
        {/* Floating Toggle Button */}
        <button
          onClick={onToggle}
          className={`absolute -right-3 top-8 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 z-50 ${collapsed ? 'rotate-180' : ''}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaChevronLeft className="w-3 h-3 text-gray-600" />
        </button>

        {/* Navigation Section */}
        <nav className={`flex-1 pt-8 pb-6 space-y-2 overflow-y-auto ${collapsed ? 'px-2' : 'px-4'}`}>
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
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
                title={collapsed ? item.label : ''}
              >
                <Icon 
                  className={`text-lg transition-transform duration-200 ${
                    collapsed ? '' : 'mr-3'
                  } ${
                    active ? "text-white" : "text-gray-500 group-hover:text-blue-500"
                  }`} 
                />
                {!collapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section with User Badge */}
        <div className={`border-t border-gray-200 mt-auto ${collapsed ? 'p-2' : 'p-4'} bg-gray-50`}>
          {/* User Profile Badge */}
          {loading ? (
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} animate-pulse`}>
              <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
              {!collapsed && (
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded w-16"></div>
                </div>
              )}
            </div>
          ) : currentUser ? (
            <div 
              className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:border-blue-300 group`}
              title={collapsed ? `${currentUser.name}\n${formatRole(currentUser.role)}` : undefined}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-200">
                  {getUserInitials(currentUser.name)}
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
              </div>

              {/* User Info */}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate leading-tight">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <FaShieldAlt className="text-gray-900 text-xs" />
                    <span className="text-xs font-medium text-gray-900">
                      Administrator
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            !collapsed && (
              <div className="text-center">
                <p className="text-gray-500 text-xs">Not logged in</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;

