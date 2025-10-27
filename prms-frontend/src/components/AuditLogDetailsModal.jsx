import React from 'react';
import { FaTimes, FaUser, FaClock, FaShieldAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, FaDesktop, FaIdCard, FaCode, FaInfoCircle } from 'react-icons/fa';

const AuditLogDetailsModal = ({ isOpen, onClose, logData }) => {
  if (!isOpen || !logData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getResultIcon = (result) => {
    switch (result?.toLowerCase()) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
        return <FaExclamationTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const parseJsonSafely = (jsonString) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  };

  const oldValues = parseJsonSafely(logData.old_values);
  const newValues = parseJsonSafely(logData.new_values);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaShieldAlt className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Audit Log Details</h2>
                <p className="text-blue-100 text-sm">Detailed information about this audit entry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors duration-200"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaInfoCircle className="w-5 h-5 text-blue-600 mr-2" />
                Basic Information
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <FaClock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Timestamp</p>
                    <p className="text-sm text-gray-900">{formatDate(logData.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaUser className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">User</p>
                    <p className="text-sm text-gray-900">{logData.username || 'Unknown'} ({logData.user_type})</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Action</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {logData.action}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaFileAlt className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Entity</p>
                    <p className="text-sm text-gray-900">
                      {logData.entity_type && logData.entity_id 
                        ? `${logData.entity_type} #${logData.entity_id}`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getResultIcon(logData.result)}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Result</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getResultColor(logData.result)}`}>
                      {logData.result}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaDesktop className="w-5 h-5 text-blue-600 mr-2" />
                Technical Details
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">IP Address</p>
                    <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
                      {logData.ip_address || 'Unknown'}
                    </code>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaIdCard className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Session ID</p>
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                      {logData.session_id || 'N/A'}
                    </code>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaDesktop className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">User Agent</p>
                    <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded border max-h-20 overflow-y-auto">
                      {logData.user_agent || 'N/A'}
                    </div>
                  </div>
                </div>

                {logData.error_message && (
                  <div className="flex items-start space-x-3">
                    <FaExclamationTriangle className="w-4 h-4 text-red-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700">Error Message</p>
                      <p className="text-sm text-red-600">{logData.error_message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Changes */}
          {(oldValues || newValues) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <FaCode className="w-5 h-5 text-blue-600 mr-2" />
                Data Changes
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field
                        </th>
                        {oldValues && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Previous Value
                          </th>
                        )}
                        {newValues && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            New Value
                          </th>
                        )}
                        {oldValues && newValues && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        // Get all unique keys from both old and new values
                        const allKeys = new Set([
                          ...(oldValues ? Object.keys(oldValues) : []),
                          ...(newValues ? Object.keys(newValues) : [])
                        ]);
                        
                        return Array.from(allKeys).map((key) => {
                          const oldValue = oldValues?.[key];
                          const newValue = newValues?.[key];
                          const hasChanged = oldValue !== newValue;
                          
                          return (
                            <tr key={key} className={hasChanged ? 'bg-yellow-50' : ''}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                                {key.replace(/_/g, ' ')}
                              </td>
                              {oldValues && (
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <div className="max-w-xs truncate" title={oldValue}>
                                    {oldValue || <span className="text-gray-400 italic">Empty</span>}
                                  </div>
                                </td>
                              )}
                              {newValues && (
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <div className="max-w-xs truncate" title={newValue}>
                                    {newValue || <span className="text-gray-400 italic">Empty</span>}
                                  </div>
                                </td>
                              )}
                              {oldValues && newValues && (
                                <td className="px-4 py-3 text-sm">
                                  {hasChanged ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Changed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Unchanged
                                    </span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Raw Data (for debugging) - Collapsible */}
          <details className="mt-6">
            <summary className="text-lg font-semibold text-gray-900 flex items-center cursor-pointer hover:text-blue-600 transition-colors">
              <FaCode className="w-5 h-5 text-blue-600 mr-2" />
              Raw Data (Click to expand)
            </summary>
            
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(logData, null, 2)}
              </pre>
            </div>
          </details>
        </div>

      </div>
    </div>
  );
};

export default AuditLogDetailsModal;

