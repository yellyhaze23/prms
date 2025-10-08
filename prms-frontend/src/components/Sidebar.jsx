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
  FaHospital,
  FaStethoscope,
  FaChartLine, // Added FaChartLine icon for ARIMA Forecasting
} from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/"); 
    window.location.reload(); 
  };

      const navItems = [
        { path: "/", icon: FaTachometerAlt, label: "Dashboard" },
        { path: "/patient", icon: FaUser, label: "Patient" },
        { path: "/records", icon: FaRegFileAlt, label: "Medical Records" },
        { path: "/diseases", icon: FaStethoscope, label: "Diseases" },
        { path: "/tracker", icon: FaMapMarkerAlt, label: "Tracker" },
        { path: "/arima-forecast", icon: FaChartLine, label: "Forecast" },
        { path: "/reports", icon: FaChartBar, label: "Reports" },
        { path: "/settings", icon: FaCog, label: "Settings" },
      ];

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50 z-50 hidden lg:block">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaHospital className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">RHU</h1>
              <p className="text-slate-400 text-xs">Patient Record System</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon 
                  className={`mr-3 text-lg transition-transform duration-200 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`} 
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <FaChevronRight className="text-white text-xs opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 group"
          >
            <FaSignOutAlt className="mr-3 text-lg text-slate-400 group-hover:text-red-400 transition-colors duration-200" />
            <span>Logout</span>
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
    </>
  );
}

export default Sidebar;
