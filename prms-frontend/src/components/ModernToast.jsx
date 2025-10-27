import React, { useEffect, useState } from 'react';
import { 
  FaCheckCircle, 
  FaTimes, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaTrash,
  FaEdit,
  FaPlus
} from 'react-icons/fa';

const ModernToast = ({ 
  isVisible, 
  onClose, 
  type = 'success', 
  title = 'Success!', 
  message = 'Operation completed successfully!',
  duration = 4000,
  action = null // Optional action button
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setProgress(100);
      
      if (duration > 0) {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev <= 0) {
              clearInterval(interval);
              handleClose();
              return 0;
            }
            return prev - (100 / (duration / 100));
          });
        }, 100);
        
        return () => clearInterval(interval);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconComponent: <FaCheckCircle className="w-5 h-5" />,
          progress: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconComponent: <FaExclamationCircle className="w-5 h-5" />,
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconComponent: <FaExclamationCircle className="w-5 h-5" />,
          progress: 'bg-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconComponent: <FaInfoCircle className="w-5 h-5" />,
          progress: 'bg-blue-500'
        };
      case 'delete':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconComponent: <FaTrash className="w-5 h-5" />,
          progress: 'bg-red-500'
        };
      case 'update':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconComponent: <FaEdit className="w-5 h-5" />,
          progress: 'bg-blue-500'
        };
      case 'create':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconComponent: <FaPlus className="w-5 h-5" />,
          progress: 'bg-green-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconComponent: <FaInfoCircle className="w-5 h-5" />,
          progress: 'bg-gray-500'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div className="fixed top-4 right-4 z-[10000] transform transition-all duration-300 ease-in-out">
      <div 
        className={`
          ${config.bg} ${config.border} border rounded-xl shadow-lg p-4 max-w-sm w-full
          ${isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
          backdrop-blur-sm
        `}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-xl overflow-hidden">
          <div 
            className={`h-full ${config.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start">
          <div className={`flex-shrink-0 ${config.icon}`}>
            {config.iconComponent}
          </div>
          <div className="ml-3 flex-1">
            <h4 className={`text-sm font-semibold ${config.title}`}>
              {title}
            </h4>
            <p className={`text-sm ${config.message} mt-1`}>
              {message}
            </p>
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`ml-3 flex-shrink-0 ${config.icon} hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-white/20`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernToast;

