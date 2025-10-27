import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimes, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const Toast = ({ 
  isVisible, 
  onClose, 
  type = 'success', 
  title = 'Success!', 
  message = 'Operation completed successfully!',
  duration = 4000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-500',
          title: 'text-green-800',
          message: 'text-green-700',
          iconComponent: <FaCheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          iconComponent: <FaExclamationCircle className="w-5 h-5" />
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconComponent: <FaInfoCircle className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconComponent: <FaInfoCircle className="w-5 h-5" />
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-[10000] transform transition-all duration-300 ease-in-out">
      <div 
        className={`
          ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 max-w-sm w-full
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {styles.iconComponent}
          </div>
          <div className="ml-3 flex-1">
            <h4 className={`text-sm font-semibold ${styles.title}`}>
              {title}
            </h4>
            <p className={`text-sm ${styles.message} mt-1`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`ml-3 flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
