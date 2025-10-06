import React, { useState, useEffect } from "react";
import "./AddUser.css";

function AddUser({ isOpen, onClose, onSubmit, editing, userData,  }) {
  const [form, setForm] = useState({
    id: null,
    username: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing && userData) {
      setForm({
        id: userData.id,
        username: userData.username,
        oldPassword: "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setForm({
        id: null,
        username: "",
        oldPassword: "",
        password: "",
        confirmPassword: "",
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

  if (!isOpen) return null;

  return (
    <div className="user-modal-overlay">
      <div className="user-modal-card">
        <h2>{editing ? "Edit User" : "Add User"}</h2>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          {editing && (
            <>
              <label>Old Password</label>
              <input
                type="password"
                value={form.oldPassword}
                onChange={(e) =>
                  setForm({ ...form, oldPassword: e.target.value })
                }
                placeholder="Only required if changing password"
              />
            </>
          )}

          <label>{editing ? "New Password (optional)" : "Password"}</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required={!editing}
          />

          <div className="form-error-placeholder">
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="user-modal-buttons">
            <button type="submit" className="user-modal-submit">
              {editing ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className="user-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
