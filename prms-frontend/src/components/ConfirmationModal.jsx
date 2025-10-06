import React, { useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

function ConfirmationModal({
  title = "Confirm deletion",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      onClick={onBackdropClick}
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl ring-1 ring-slate-900/10">
        <div className="px-6 pt-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FaExclamationTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="px-6 py-4 mt-4 flex items-center justify-end gap-2 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 shadow"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
