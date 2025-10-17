import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaExclamationTriangle, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaLock, 
  FaHospital,
  FaShieldAlt,
  FaChartLine,
  FaMapMarkerAlt,
  FaUsers,
  FaSpinner
} from "react-icons/fa";
import LoginLoadingModal from "../components/LoginLoadingModal";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStage, setLoadingStage] = useState('loading');

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowLoadingModal(true);
    setLoadingStage('loading');

    try {
      const res = await axios.post("http://localhost/prms/prms-backend/authenticate.php", {
        username,
        password,
      });

      if (res.data.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        
        // Show success animation
        setLoadingStage('success');
        
        // Wait for success animation to complete, then proceed with login
        setTimeout(() => {
          onLogin(res.data.user);
        }, 1500);
      } else {
        setError(res.data.message || "Login failed");
        setShowLoadingModal(false);
        setLoading(false);
      }
    } catch (err) {
      setError("Server error. Please check your connection and try again.");
      setShowLoadingModal(false);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  return (
    <div className="login-container">
      <LoginLoadingModal 
        isVisible={showLoadingModal} 
        stage={loadingStage} 
      />
      
      {/* Background Animation */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className={`login-card ${showLoadingModal ? 'loading' : ''}`}>
        {/* Left Panel - Branding & Features */}
        <div className="login-left-panel">
          <div className="brand-section">
            <div className="logo-container">
              <FaHospital className="logo-icon" />
            </div>
            <h1>RHU Patient Record System</h1>
            <p>Advanced Communicable Disease Management</p>
          </div>

          <div className="features-section">
            <h3>Key Features</h3>
            <div className="features-list">
              <div className="feature-item">
                <FaUsers className="feature-icon" />
                <span>Patient Management</span>
              </div>
              <div className="feature-item">
                <FaMapMarkerAlt className="feature-icon" />
                <span>Disease Tracking</span>
              </div>
              <div className="feature-item">
                <FaChartLine className="feature-icon" />
                <span>ARIMA Forecasting</span>
              </div>
              <div className="feature-item">
                <FaShieldAlt className="feature-icon" />
                <span>Data Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-right-panel">
          <div className="form-container">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="form-input"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="form-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
              </div>

              {error && (
                <div className="error-message">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>Secure login powered by RHU PRMS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;