import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartLine, FaUser, FaShieldAlt, FaChevronLeft } from 'react-icons/fa';

export default function Sidebar({ nav = [], brandTitle = 'Tracely', brandSubtitle = 'Track disease easily', collapsed = false, onToggle }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Only fetch if we're actually in staff mode (not admin)
      const adminToken = localStorage.getItem('admin_token');
      const adminRole = localStorage.getItem('admin_role');
      
      // Don't fetch staff profile if user is admin
      if (adminToken && adminRole === 'admin') {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/staff/me.php`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
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
      // Only fetch if we're staff, not admin
      const adminToken = localStorage.getItem('admin_token');
      const adminRole = localStorage.getItem('admin_role');
      
      if (adminToken && adminRole === 'admin') {
        return; // Don't fetch staff profile for admin users
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
    if (!name) return 'U';
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

  return (
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
      <nav className="flex-1 px-4 pt-8 pb-6 space-y-2 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `group flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {item.Icon ? (
                  <item.Icon className={`${collapsed ? '' : 'mr-3'} text-lg transition-transform duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'}`} />
                ) : null}
                {!collapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Badge Footer */}
      <div className="p-4 border-t border-gray-200 mt-auto bg-gray-50">
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
            title={collapsed ? `${currentUser.name || currentUser.username}\n${formatRole(currentUser.role)}` : undefined}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-200">
                {getUserInitials(currentUser.name || currentUser.username)}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            {/* User Info */}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate leading-tight">
                  {currentUser.name || currentUser.username}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {currentUser.role === 'admin' ? (
                    <FaShieldAlt className="text-gray-900 text-xs" />
                  ) : (
                    <FaUser className="text-blue-500 text-xs" />
                  )}
                  <span className={`text-xs font-medium ${
                    currentUser.role === 'admin' ? 'text-gray-900' : 'text-blue-600'
                  }`}>
                    {formatRole(currentUser.role)}
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
  );
}

