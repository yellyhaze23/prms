import React, { useState } from 'react';
import ModernToast from './ModernToast';
import ModernAlert from './ModernAlert';
import ModernConfirmationModal from './ModernConfirmationModal';

const AlertExamples = () => {
  const [toast, setToast] = useState(null);
  const [alert, setAlert] = useState(null);
  const [modal, setModal] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ isVisible: true, type, title, message });
  };

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
  };

  const showModal = (type, title, message, confirmLabel) => {
    setModal({ 
      isVisible: true, 
      type, 
      title, 
      message, 
      confirmLabel,
      onConfirm: () => {
        console.log('Confirmed!');
        setModal(null);
        showToast('success', 'Confirmed!', 'Action completed successfully!');
      },
      onCancel: () => setModal(null)
    });
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Modern Alert Examples</h1>
      
      {/* Toast Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => showToast('success', 'Success!', 'Patient added successfully!')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Success Toast
          </button>
          <button 
            onClick={() => showToast('error', 'Error!', 'Failed to save patient data.')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Error Toast
          </button>
          <button 
            onClick={() => showToast('update', 'Updated!', 'Patient information updated.')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Toast
          </button>
          <button 
            onClick={() => showToast('delete', 'Deleted!', 'Patient record deleted.')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Toast
          </button>
        </div>
      </div>

      {/* Alert Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Alert Banners</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => showAlert('success', 'System Status', 'All systems are running normally.')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Success Alert
          </button>
          <button 
            onClick={() => showAlert('warning', 'High Cases', 'Dengue cases are above normal levels.')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Warning Alert
          </button>
          <button 
            onClick={() => showAlert('error', 'System Error', 'Database connection failed.')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Error Alert
          </button>
        </div>
      </div>

      {/* Modal Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Confirmation Modals</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => showModal('danger', 'Delete Patient', 'Are you sure you want to delete this patient? This action cannot be undone.', 'Delete')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Modal
          </button>
          <button 
            onClick={() => showModal('update', 'Update Patient', 'Save changes to patient information?', 'Save Changes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Modal
          </button>
          <button 
            onClick={() => showModal('info', 'System Maintenance', 'The system will be under maintenance for 2 hours. Continue?', 'Continue')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Info Modal
          </button>
        </div>
      </div>

      {/* Display Alert if exists */}
      {alert && (
        <div className="mt-6">
          <ModernAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Toast Component */}
      {toast && (
        <ModernToast
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          type={toast.type}
          title={toast.title}
          message={toast.message}
        />
      )}

      {/* Modal Component */}
      {modal && modal.isVisible && (
        <ModernConfirmationModal
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
          confirmLabel={modal.confirmLabel}
          type={modal.type}
        />
      )}
    </div>
  );
};

export default AlertExamples;

