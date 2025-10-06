import React, { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaUserCheck,
  FaFileMedicalAlt,
} from "react-icons/fa";
import "./AlertsAndReminders.css";

const AlertsAndReminders = () => {
  const [alerts, setAlerts] = useState({
    followUps: [],
    incompleteHealthExams: [],
    incompleteMedicalRecords: [],
  });

  useEffect(() => {
    // TODO: Implement get_alerts.php endpoint
    setAlerts({
      followUps: [],
      incompleteHealthExams: [],
      incompleteMedicalRecords: [],
    });
  }, []);

  return (
    <div className="alerts-container">
      <div className="alert-cards">
        <div className="alert-wrapper">
          <div className="alert-section-header">
            <div className="section-icon calendar">
              <FaCalendarCheck />
            </div>
            <h3>Follow-Up Reminders This Week</h3>
          </div>
          <div className="alert-section-body">
            {alerts.followUps.length === 0 ? (
              <p className="empty-msg">No upcoming follow-ups this week.</p>
            ) : (
              <ul className="styled-list">
                {alerts.followUps.map((item) => (
                  <li key={item.id}>
                    <strong>{item.full_name}</strong> –{" "}
                    <span className="date">
                      Follow-up on {item.follow_up_date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="alert-wrapper">
          <div className="alert-section-header">
            <div className="section-icon user">
              <FaUserCheck />
            </div>
            <h3>Patients Not Yet Evaluated</h3>
          </div>
          <div className="alert-section-body">
            {alerts.incompleteHealthExams.length === 0 ? (
              <p className="empty-msg">All patients have health evaluations.</p>
            ) : (
              <ul className="styled-list">
                {alerts.incompleteHealthExams.map((item) => (
                  <li key={item.id}>
                    <em>{item.full_name}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="alert-wrapper">
          <div className="alert-section-header">
            <div className="section-icon file">
              <FaFileMedicalAlt />
            </div>
            <h3>Incomplete Medical Records</h3>
          </div>
          <div className="alert-section-body">
            {alerts.incompleteMedicalRecords.length === 0 ? (
              <p className="empty-msg">All medical records are complete.</p>
            ) : (
              <ul className="styled-list">
                {alerts.incompleteMedicalRecords.map((item) => (
                  <li key={item.id}>
                    <em>{item.full_name}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsAndReminders;
