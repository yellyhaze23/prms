import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import "./AddUser.css";

function AddUser({ isOpen, onClose, onSubmit, editing, userData,  }) {
  const [form, setForm] = useState({
    id: null,
    username: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
    role: "staff",
    status: "active",
  });
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (editing && userData) {
      setForm({
        id: userData.id,
        username: userData.username,
        oldPassword: "",
        password: "",
        confirmPassword: "",
        role: userData.role || "staff",
        status: userData.status || "active",
      });
    } else {
      setForm({
        id: null,
        username: "",
        oldPassword: "",
        password: "",
        confirmPassword: "",
        role: "staff",
        status: "active",
      });
    }
    setError("");
  }, [editing, userData]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); 

  // If changing password, validate new password & confirmation
  const wantsPasswordChange = form.password.trim().length > 0 || form.confirmPassword.trim().length > 0;

  if (wantsPasswordChange) {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (editing && !form.oldPassword.trim()) {
      setError("Old password is required to change password.");
      return;
    }
  }

  const result = await onSubmit(form);

  if (result && result.success === false) {
    setError(result.message);
  }
};

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="user-modal-overlay">
      <div className="user-modal-card">
        {/* Header */}
        <div className="user-modal-header">
          <div className="user-modal-title-section">
            <div className="user-modal-icon">
              <FaUser className="w-5 h-5" />
            </div>
            <div>
              <h2 className="user-modal-title">{editing ? "Edit User" : "Add User"}</h2>
              <p className="user-modal-subtitle">
                {editing ? "Update user information and password" : "Create a new user account"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="user-modal-close-btn"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-modal-form">
          {/* Username Field */}
          <div className="user-modal-field">
            <label className="user-modal-label">
              <FaUser className="w-4 h-4" />
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="user-modal-input"
              placeholder="Enter username"
              required
            />
          </div>

          {/* Old Password Field (only for editing) */}
          {editing && (
            <div className="user-modal-field">
              <label className="user-modal-label">
                <FaLock className="w-4 h-4" />
                Old Password
              </label>
              <div className="user-modal-password-container">
                <input
                  type={showPasswords.oldPassword ? "text" : "password"}
                  value={form.oldPassword}
                  onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                  className="user-modal-input user-modal-password-input"
                  placeholder="Only required if changing password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  className="user-modal-password-toggle"
                >
                  {showPasswords.oldPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password Field */}
          <div className="user-modal-field">
            <label className="user-modal-label">
              <FaLock className="w-4 h-4" />
              {editing ? "New Password (optional)" : "Password"}
            </label>
            <div className="user-modal-password-container">
              <input
                type={showPasswords.password ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="user-modal-input user-modal-password-input"
                placeholder={editing ? "Enter new password" : "Enter password"}
                required={!editing}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className="user-modal-password-toggle"
              >
                {showPasswords.password ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="user-modal-field">
            <label className="user-modal-label">
              <FaLock className="w-4 h-4" />
              Confirm Password
            </label>
            <div className="user-modal-password-container">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="user-modal-input user-modal-password-input"
                placeholder="Confirm password"
                required={!editing}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="user-modal-password-toggle"
              >
                {showPasswords.confirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Field */}
          <div className="user-modal-field">
            <label className="user-modal-label">
              <FaUser className="w-4 h-4" />
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="user-modal-input"
              required
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Field */}
          <div className="user-modal-field">
            <label className="user-modal-label">
              <FaUser className="w-4 h-4" />
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="user-modal-input"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="user-modal-error">
              <p className="user-modal-error-text">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="user-modal-actions">
            <button
              type="button"
              className="user-modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="user-modal-submit-btn">
              {editing ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;

