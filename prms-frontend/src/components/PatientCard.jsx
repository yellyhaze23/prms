import React from "react";
import "./PatientCard.css";

function PatientCard({ patients, onSelect }) {
  return (
    <div className="patient-card-list">
      {patients.length === 0 ? (
        <p className="empty-msg">No patients found.</p>
      ) : (
        patients.map((patient, index) => {
          const imageSrc = patient.image_path
            ? `http://localhost/prms/prms-backend/uploads/${patient.image_path}`
            : "/lspu-logo.png";

          return (
            <div
              key={patient.id || index}
              className="patient-card-box"
              onClick={() => onSelect(patient)}
            >
              <div className="image">
                <img src={imageSrc} alt="Patient" className="patient-img" />
              </div>
              <div className="details">
                <p className="card-info">{patient.patient_id}</p> 
                <h3 className="card-name">{patient.full_name}</h3>
                <p className="card-info">{patient.course_year_section}</p>
                <p className="card-info">{patient.department}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PatientCard;
