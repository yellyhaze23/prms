import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartLine, FaChevronRight, FaSignOutAlt } from 'react-icons/fa';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function Sidebar({ nav = [], brandTitle = 'Tracely', brandSubtitle = 'Track disease easily', collapsed = false }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/"); 
    window.location.reload(); 
  };

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 z-50 hidden lg:block transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
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
      <nav className="flex-1 px-4 py-6 space-y-2">
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

      {/* Footer with Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={() => setShowModal(true)}
          className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 group`}
          title={collapsed ? "Logout" : undefined}
        >
          <FaSignOutAlt className={`${collapsed ? '' : 'mr-3'} text-lg text-slate-400 group-hover:text-red-400 transition-colors duration-200`} />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="text-xs text-slate-500 mt-2">&copy; {new Date().getFullYear()}</div>
        )}
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
    </>
  );
}
