import React from 'react';
import { FaSignOutAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import './LogoutAnimationModal.css';

const LogoutAnimationModal = ({ isVisible, stage = 'loading' }) => {
  if (!isVisible) return null;

  return (
    <div className="logout-animation-overlay">
      <div className="logout-animation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-content">
          {/* Logo */}
          <div className="logout-logo">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-blue-100">
              <img 
                src="/rhulogo.png" 
                alt="RHU Logo" 
                className="w-full h-full object-contain p-2" 
              />
            </div>
          </div>
          
          {/* Animation Container */}
          <div className="logout-animation-container">
            {stage === 'loading' && (
              <div className="loading-animation">
                <div className="spinner-ring">
                  <div className="spinner-fill"></div>
                </div>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            {stage === 'success' && (
              <div className="success-animation">
                <div className="success-circle">
                  <FaCheckCircle className="success-icon" />
                </div>
                <div className="success-ripple"></div>
                <div className="success-ripple delay-1"></div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="logout-text">
            {stage === 'loading' && (
              <>
                <h3 className="logout-title">Signing you out</h3>
                <p className="logout-subtitle">Securing your session and clearing data</p>
              </>
            )}
            
            {stage === 'success' && (
              <>
                <h3 className="logout-title success">Goodbye!</h3>
                <p className="logout-subtitle">You have been successfully logged out</p>
              </>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="logout-progress-container">
            <div className="logout-progress-bar">
              <div className={`logout-progress-fill ${stage === 'success' ? 'complete' : ''}`}></div>
            </div>
            <div className="progress-text">
              {stage === 'loading' ? 'Processing...' : 'Complete'}
            </div>
          </div>
          
          {/* Security Badge */}
          <div className="security-badge">
            <div className="security-icon">
              <FaSignOutAlt />
            </div>
            <span>Session Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutAnimationModal;

