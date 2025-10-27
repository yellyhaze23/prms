import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartLine, FaChevronRight, FaUser, FaShieldAlt } from 'react-icons/fa';

export default function Sidebar({ nav = [], brandTitle = 'Tracely', brandSubtitle = 'Track disease easily', collapsed = false }) {
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
        const response = await fetch('http://localhost/prms-backend/api/staff/me.php', {
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
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 z-50 hidden lg:flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Header Section */}
      <div className="p-6 border-b border-slate-700/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FaChartLine className="text-white text-xl" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">{brandTitle}</h1>
              <p className="text-slate-400 text-xs">{brandSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `group flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {item.Icon ? (
                  <item.Icon className={`${collapsed ? '' : 'mr-3'} text-lg transition-transform duration-200 text-slate-400 group-hover:text-white`} />
                ) : null}
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <FaChevronRight className="text-white text-xs opacity-70" />}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Badge Footer */}
      <div className="p-4 border-t border-slate-700/50 mt-auto">
        {loading ? (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} animate-pulse`}>
            <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
            {!collapsed && (
              <div className="flex-1">
                <div className="h-3 bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-2 bg-slate-700 rounded w-16"></div>
              </div>
            )}
          </div>
        ) : currentUser ? (
          <div 
            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-700/50 border border-slate-600/30 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/30 group`}
            title={collapsed ? `${currentUser.name || currentUser.username}\n${formatRole(currentUser.role)}` : undefined}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-200">
                {getUserInitials(currentUser.name || currentUser.username)}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
            </div>

            {/* User Info */}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate leading-tight">
                  {currentUser.name || currentUser.username}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {currentUser.role === 'admin' ? (
                    <FaShieldAlt className="text-amber-400 text-xs" />
                  ) : (
                    <FaUser className="text-blue-400 text-xs" />
                  )}
                  <span className={`text-xs font-medium ${
                    currentUser.role === 'admin' ? 'text-amber-400' : 'text-blue-400'
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
              <p className="text-slate-400 text-xs">Not logged in</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

