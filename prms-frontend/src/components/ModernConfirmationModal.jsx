import React, { useEffect } from "react";
import { 
  FaExclamationTriangle, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";

function ModernConfirmationModal({
  title = "Confirm action",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "warning", // warning, danger, info, success
  icon = null,
  isLoading = false
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel && onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onCancel && onCancel();
  };

  const getModalConfig = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          iconComponent: icon || <FaTrash className="h-5 w-5" />
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          iconComponent: icon || <FaExclamationTriangle className="h-5 w-5" />
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          iconComponent: icon || <FaInfoCircle className="h-5 w-5" />
        };
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          iconComponent: icon || <FaCheckCircle className="h-5 w-5" />
        };
      case 'update':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          iconComponent: icon || <FaEdit className="h-5 w-5" />
        };
      default:
        return {
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          confirmBg: 'bg-gray-600 hover:bg-gray-700',
          iconComponent: icon || <FaExclamationTriangle className="h-5 w-5" />
        };
    }
  };

  const config = getModalConfig();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onBackdropClick}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl ring-1 ring-gray-900/10 transform transition-all duration-300 scale-100">
        <div className="px-6 pt-6 flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}>
            <div className={config.iconColor}>
              {config.iconComponent}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="px-6 py-6 mt-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white ${config.confirmBg} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModernConfirmationModal;

