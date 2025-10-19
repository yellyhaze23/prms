import React from 'react';
import { FaClock, FaExclamationTriangle, FaUserClock } from 'react-icons/fa';

const SessionWarningModal = ({ timeRemaining, onExtend, onLogout }) => {
  const formatTime = (minutes) => {
    if (minutes < 1) {
      return 'Less than 1 minute';
    }
    return `${Math.ceil(minutes)} minute${Math.ceil(minutes) !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-yellow-500 text-2xl mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Session Timeout Warning</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Your session will expire in <strong className="text-red-600">{formatTime(timeRemaining)}</strong> due to inactivity.
        </p>
        
        <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-lg">
          <FaUserClock className="text-blue-500 mr-2" />
          <span className="text-sm text-gray-600">
            Click anywhere or press any key to extend your session
          </span>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-medium"
          >
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors font-medium"
          >
            Logout Now
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          This warning appears to protect sensitive health data
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
