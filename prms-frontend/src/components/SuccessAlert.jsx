import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const SuccessAlert = ({ 
  isVisible, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully!",
  duration = 500
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Success Icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Message */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-700">

        </div>
      </div>
    </div>
  );
};

export default SuccessAlert;