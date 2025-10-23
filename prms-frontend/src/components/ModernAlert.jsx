import React, { useEffect, useRef } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes,
  FaShieldAlt,
  FaBell
} from 'react-icons/fa';

const ModernAlert = ({ 
  type = 'info',
  title,
  message,
  onClose,
  dismissible = true,
  icon = null,
  action = null,
  autoHide = false,
  duration = 5000 // 5 seconds default
}) => {
  const timeoutRef = useRef(null);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && onClose) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, duration);

      // Cleanup timeout on unmount or when dependencies change
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [autoHide, duration, onClose]);
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconComponent: icon || <FaCheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconComponent: icon || <FaExclamationTriangle className="w-5 h-5" />
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconComponent: icon || <FaExclamationTriangle className="w-5 h-5" />
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconComponent: icon || <FaInfoCircle className="w-5 h-5" />
        };
      case 'security':
        return {
          bg: 'bg-gradient-to-r from-purple-50 to-violet-50',
          border: 'border-purple-200',
          icon: 'text-purple-600',
          title: 'text-purple-800',
          message: 'text-purple-700',
          iconComponent: icon || <FaShieldAlt className="w-5 h-5" />
        };
      case 'notification':
        return {
          bg: 'bg-gradient-to-r from-indigo-50 to-blue-50',
          border: 'border-indigo-200',
          icon: 'text-indigo-600',
          title: 'text-indigo-800',
          message: 'text-indigo-700',
          iconComponent: icon || <FaBell className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconComponent: icon || <FaInfoCircle className="w-5 h-5" />
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 shadow-sm`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${config.icon}`}>
          {config.iconComponent}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${config.title} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.message}`}>
            {message}
          </p>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${config.icon} hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-white/20`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ModernAlert;
