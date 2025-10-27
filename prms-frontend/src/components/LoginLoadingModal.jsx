import React from 'react';
import { FaSpinner, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import './LoginLoadingModal.css';

const LoginLoadingModal = ({ isVisible, stage = 'loading' }) => {
  if (!isVisible) return null;

  return (
    <div className="login-loading-overlay">
      <div className="login-loading-modal">
        <div className="loading-content">
          {/* Logo/Icon */}
          <div className="loading-logo">
            <FaChartLine className="logo-icon" />
          </div>
          
          {/* Loading Animation */}
          <div className="loading-animation">
            {stage === 'loading' && (
              <div className="spinner-container">
                <FaSpinner className="loading-spinner" />
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            {stage === 'success' && (
              <div className="success-animation">
                <FaCheckCircle className="success-icon" />
                <div className="success-ripple"></div>
              </div>
            )}
          </div>
          
          {/* Loading Text */}
          <div className="loading-text">
            {stage === 'loading' && (
              <>
                <h3>Signing you in...</h3>
                <p>Please wait while we authenticate your credentials</p>
              </>
            )}
            
            {stage === 'success' && (
              <>
                <h3>Welcome back!</h3>
                <p>Redirecting to your dashboard</p>
              </>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="loading-progress">
            <div className="progress-bar">
              <div className={`progress-fill ${stage === 'success' ? 'progress-complete' : ''}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLoadingModal;

