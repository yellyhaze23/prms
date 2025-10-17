import React from 'react';
import { FaDatabase, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useBackup } from '../contexts/BackupContext';

const BackupStatusIndicator = () => {
  const { globalBackupState, cancelBackup } = useBackup();

  if (!globalBackupState.isRunning) {
    return null;
  }

  const getStatusIcon = () => {
    switch (globalBackupState.currentAction) {
      case 'create':
        return <FaDatabase className="w-4 h-4" />;
      case 'restore':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'delete':
        return <FaExclamationTriangle className="w-4 h-4" />;
      default:
        return <FaSpinner className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (globalBackupState.currentAction) {
      case 'create':
        return 'Creating backup...';
      case 'restore':
        return 'Restoring database...';
      case 'delete':
        return 'Deleting backup...';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (globalBackupState.currentAction) {
      case 'create':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'restore':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {globalBackupState.currentAction === 'create' && (
          <span className="text-xs text-gray-600">
            {Math.round(globalBackupState.progress)}%
          </span>
        )}
      </div>
      
      {globalBackupState.currentAction === 'create' && (
        <div className="flex items-center space-x-2">
          {/* Progress bar */}
          <div className="w-16 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${globalBackupState.progress}%` }}
            />
          </div>
          
          {/* Cancel button */}
          {globalBackupState.canCancel && (
            <button
              onClick={cancelBackup}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Cancel backup"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BackupStatusIndicator;
