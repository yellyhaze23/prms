import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaSave } from "react-icons/fa";
import Toast from "./Toast";
import "./MedicalRecords.css";

function MedicalRecords({ patient }) {
  const [medicalRecord, setMedicalRecord] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    if (patient?.id) {
      // TODO: Implement get_medical_records.php endpoint
      setMedicalRecord({});
      setLoading(false);
    } else {
      setMedicalRecord({});
      setLoading(false);
    }
  }, [patient]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "family_medical_history") {
      let history = medicalRecord.family_medical_history?.split(",").map(s => s.trim()) || [];
      if (checked) history.push(value);
      else history = history.filter(item => item !== value);
      setMedicalRecord(prev => ({ ...prev, family_medical_history: [...new Set(history)].join(", ") }));
    } else if (type === "radio") {
      setMedicalRecord(prev => ({ ...prev, [name]: value }));
    } else {
      setMedicalRecord((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleEdit = async () => {
    if (isEditing) {
      try {
        // TODO: Implement update_medical_records.php endpoint
        showToast("Medical record updated successfully.", "success");
      } catch (error) {
        console.error("Update error:", error);
        showToast("An error occurred while updating.", "error");
      }
    }
    setIsEditing((prev) => !prev);
  };

  if (!patient || loading) {
    return (
      <div className="card-loading">
        <p>{!patient ? "No patient selected." : "Loading medical record…"}</p>
      </div>
    );
  }

  const r = medicalRecord || {};
  const familyItems = [
    "Allergy", "Asthma", "Tuberculosis", "Hypertension", "Heart Disease",
    "Stroke", "Diabetes", "Cancer", "Liver Disease", "Kidney Disease",
    "Blood Disorder", "Epilepsy", "Mental Disorder"
  ];
  const selectedFamily = r.family_medical_history?.split(",").map(s => s.trim()) || [];

  const renderYesNo = (field) => (
    <div className="checkboxes">
      <label>
        <input
          type="checkbox"
          name={field}
          value="1"
          checked={r[field] === "1"}
          onChange={handleChange}
          disabled={!isEditing}
        />
        Yes
      </label>
      <label>
        <input
          type="checkbox"
          name={field}
          value="0"
          checked={r[field] === "0"}
          onChange={handleChange}
          disabled={!isEditing}
        />
        No
      </label>
    </div>
  );

  return (
    <div className="medical-records-form">
      <div className="card">
        <div className="card-header">
          <h3>Past Medical and Dental History</h3>
          <button
            onClick={toggleEdit}
            className={`action-button ${isEditing ? "save" : "edit"}`}
            title={isEditing ? "Save" : "Edit"}
          >
            {isEditing ? <FaSave /> : <FaEdit />}
          </button>
        </div>
        {[
          "known_illnesses", "past_hospitalizations", "known_allergies",
          "childhood_immunizations", "present_immunizations",
          "current_medications", "dental_problems"
        ].map((field) => (
          <div className="info-item" key={field}>
            <strong>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
            {isEditing ? (
              <textarea name={field} value={r[field] || ""} onChange={handleChange} />
            ) : (
              r[field]
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Primary Care Physician</h3>
        <div className="row">
          {["physician_name", "physician_specialty", "clinic_location"].map((field) => (
            <div className="info-item" key={field}>
              <strong>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
              {isEditing ? (
                <input name={field} value={r[field] || ""} onChange={handleChange} />
              ) : (
                r[field]
              )}
            </div>
          ))}
        </div>
        <div className="row">
          <div className="info-item">
            <strong>Last Check-up:</strong>
            {isEditing ? (
              <input type="date" name="last_checkup_date" value={r.last_checkup_date || ""} onChange={handleChange} />
            ) : (
              fmtDate(r.last_checkup_date)
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Family Medical History</h3>
        <div className="row checkbox-row">
          {familyItems.map((item) => (
            <div className="info-item checkbox" key={item}>
              <label>
                <input
                  type="checkbox"
                  name="family_medical_history"
                  value={item}
                  checked={selectedFamily.includes(item)}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                {item}
              </label>
            </div>
          ))}
        </div>
        <div className="info-item">
          <strong>Others:</strong>
          {isEditing ? (
            <textarea name="family_history_others" value={r.family_history_others || ""} onChange={handleChange} />
          ) : (
            r.family_history_others || "None"
          )}
        </div>
      </div>

      <div className="card">
        <div className="div">
          <h3>Personal and Social History</h3>
          <div className="row">
            {["alcohol_use", "tobacco_use", "drug_use"].map((field) => (
              <div className="info-item" key={field}>
                <strong>{field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                {isEditing ? renderYesNo(field) : r[field] === "1" ? "Yes" : "No"}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
      <h3>Vital Signs</h3>
        <div className="row">
          {["height", "weight", "BMI"].map((field) => (
            <div className="info-item" key={field}>
              <strong>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
              {isEditing ? (
                <input name={field} value={r[field] || ""} onChange={handleChange} />
              ) : (
                r[field]
              )}
            </div>
          ))}
        </div>
        <div className="row">
          {["blood_pressure", "heart_rate"].map((field) => (
            <div className="info-item" key={field}>
              <strong>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
              {isEditing ? (
                <input name={field} value={r[field] || ""} onChange={handleChange} />
              ) : (
                r[field]
              )}
            </div>
          ))}
        </div>
        <div className="row">
          {["respiratory_rate", "temperature"].map((field) => (
            <div className="info-item" key={field}>
              <strong>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
              {isEditing ? (
                <input name={field} value={r[field] || ""} onChange={handleChange} />
              ) : (
                r[field]
              )}
            </div>
          ))}
        </div>
      </div>

      {r.sex?.toLowerCase() === "female" ? (
        <div className="card">
          <h3>Female-Specific Section</h3>
          <div className="info-item">
            <strong>Last Menstrual Period:</strong>
            {isEditing ? (
              <input type="date" name="last_menstrual_period" value={r.last_menstrual_period || ""} onChange={handleChange} />
            ) : (
              fmtDate(r.last_menstrual_period)
            )}
          </div>
          <div className="row">
            <div className="info-item">
              <strong>Menstrual Cycle:</strong>
              {isEditing ? (
                <input name="menstrual_cycle" value={r.menstrual_cycle || ""} onChange={handleChange} />
              ) : (
                r.menstrual_cycle || "None"
              )}
            </div>
            <div className="info-item">
              <strong>Menstrual Duration:</strong>
              {isEditing ? (
                <input name="menstrual_duration" value={r.menstrual_duration || ""} onChange={handleChange} />
              ) : (
                `${r.menstrual_duration || 0} days`
              )}
            </div>
          </div>
          <div className="row">
            <div className="info-item">
              <strong>Pads per Day:</strong>
              {isEditing ? (
                <input name="pads_per_day" value={r.pads_per_day || ""} onChange={handleChange} />
              ) : (
                r.pads_per_day
              )}
            </div>
            <div className="info-item">
              <strong>Dysmenorrhea:</strong>
              {isEditing ? (
                <input name="dysmenorrhea" value={r.dysmenorrhea || ""} onChange={handleChange} />
              ) : (
                r.dysmenorrhea
              )}
            </div>
          </div>
          <div className="info-item">
            <strong>Last OB-Gyne Checkup:</strong>
            {isEditing ? (
              <input type="date" name="last_obgyne_checkup" value={r.last_obgyne_checkup || ""} onChange={handleChange} />
            ) : (
              fmtDate(r.last_obgyne_checkup)
            )}
          </div>
          <div className="row">
            {["abnormal_bleeding", "previous_pregnancy", "has_children"].map((field) => (
              <div className="info-item" key={field}>
                <strong>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                {isEditing ? renderYesNo(field) : r[field] === "1" ? "Yes" : "No"}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card note">
          <p>(must be female to view female-specific section.)</p>
        </div>
      )}

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
    </div>
  );
}

export default MedicalRecords;
