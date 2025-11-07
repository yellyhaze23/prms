import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  FaExclamationTriangle, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaLock, 
  FaChartLine,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaSpinner,
  FaQuestionCircle,
  FaTimes
} from "react-icons/fa";
import LoginLoadingModal from "../components/LoginLoadingModal";
import "./Login.css";
// Animation variants
import { 
  loginVariants, 
  containerVariants, 
  cardVariants, 
  formVariants,
  buttonVariants,
  fadeInVariants 
} from '../utils/animations';

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStage, setLoadingStage] = useState('loading');
  const [showHelpModal, setShowHelpModal] = useState(false);

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

    // Client-side validation
    if (!username.trim()) {
      setError("Please enter your username or email");
      setShowLoadingModal(false);
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      setShowLoadingModal(false);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/authenticate.php`, 
        { username, password },
        {
	  timeout: 10000,
	  withCredentials: true
	}
      );

      if (res.data.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        
        // Show success animation
        setLoadingStage('success');
        
        // Wait for success animation to complete
        setTimeout(() => {
          onLogin(res.data.user);
        }, 1500);
      } else {
        // Display backend error message
        setError(res.data.message || "Login failed. Please try again.");
        setShowLoadingModal(false);
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle network errors
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("Connection timeout. Please try again.");
      } else if (err.message.includes('Network Error')) {
        setError("Cannot connect to server. Please try again.");
      } else if (err.response) {
        setError("Server error. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
      
      setShowLoadingModal(false);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  return (
    <motion.div 
      className="login-container"
      variants={loginVariants}
      initial="hidden"
      animate="visible"
    >
      <LoginLoadingModal 
        isVisible={showLoadingModal} 
        stage={loadingStage} 
      />
      
      {/* Background Animation */}
      <motion.div 
        className="login-background"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </motion.div>

      <motion.div 
        className={`login-card ${showLoadingModal ? 'loading' : ''} relative`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Help Button - Top Right Corner */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200 z-10"
          title="Login Help"
        >
          <FaQuestionCircle className="w-5 h-5" />
        </button>
        {/* Left Panel - Branding & Features */}
        <motion.div 
          className="login-left-panel"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="brand-section"
            variants={cardVariants}
          >
            <div className="logo-container">
              <img 
                src="/rhulogo.png" 
                alt="RHU Logo" 
                className="logo-icon" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            <h1>
              Patient Record System<br />
              with Tracking & Forecasting<br />
            </h1>
          </motion.div>

          <motion.div 
            className="features-section"
            variants={cardVariants}
          >
            <h3>Key Features</h3>
            <motion.div 
              className="features-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="feature-item"
                variants={cardVariants}
              >
                <FaUsers className="feature-icon" />
                <span>Patient Management</span>
              </motion.div>
              <motion.div 
                className="feature-item"
                variants={cardVariants}
              >
                <FaMapMarkerAlt className="feature-icon" />
                <span>Disease Tracking</span>
              </motion.div>
              <motion.div 
                className="feature-item"
                variants={cardVariants}
              >
                <FaChartLine className="feature-icon" />
                <span>ARIMA Forecasting</span>
              </motion.div>
              <motion.div 
                className="feature-item"
                variants={cardVariants}
              >
                <FaShieldAlt className="feature-icon" />
                <span>Data Security</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div 
          className="login-right-panel"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="form-container"
            variants={formVariants}
          >
            <motion.div 
              className="form-header"
              variants={cardVariants}
            >
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard</p>
            </motion.div>

            <motion.form 
              onSubmit={handleLogin} 
              className="login-form"
              variants={formVariants}
            >
              <motion.div 
                className="form-group"
                variants={cardVariants}
              >
                <label htmlFor="username" className="form-label">
                  Username or email
                </label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="form-input"
                    autoComplete="username"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="form-group"
                variants={cardVariants}
              >
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
                  <motion.button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    disabled={loading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                className="form-options"
                variants={cardVariants}
              >
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
              </motion.div>

              {error && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaExclamationTriangle className="error-icon" />
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.button 
                type="submit" 
                className="login-button"
                disabled={loading}
                variants={cardVariants}
                whileHover={buttonVariants.hover}
                whileTap={buttonVariants.tap}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </motion.form>

            <motion.div 
              className="form-footer"
              variants={cardVariants}
            >
              <p>Secure login powered by PRSTF</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Login Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <FaQuestionCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Login Help</h2>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Getting Started</h4>
                <p className="text-blue-700 text-sm">Use your provided username and password to access the Tracely system.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Login Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Enter your username in the username field</li>
                  <li>Enter your password in the password field</li>
                  <li>Check "Remember Me" to save your username for next time</li>
                  <li>Click "Sign In" to access your dashboard</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">User Roles:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li><strong>Administrator:</strong> Full system access and management</li>
                  <li><strong>Staff:</strong> Patient management and medical records</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Troubleshooting:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Make sure your username and password are correct</li>
                  <li>Check your internet connection</li>
                  <li>Contact your system administrator if issues persist</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Help
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default Login;
