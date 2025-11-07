import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaTimes, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaEnvelope,
  FaKey
} from 'react-icons/fa';

const AdminPasswordResetModal = ({ isOpen, onClose, username, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Request code, 2: Enter code, 3: New password
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen && step === 1 && username) {
      // Auto-send code when modal opens
      handleSendCode();
    }
  }, [isOpen, step, username]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/send_reset_code.php`,
        { username },
        { timeout: 10000 }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setStep(2);
        setCountdown(600); // 10 minutes
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send verification code. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code' });
      return;
    }
    // Just move to next step - actual verification happens when password is submitted
    setStep(3);
    setMessage({ type: '', text: '' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/verify_code_reset.php`,
        { username, code, password },
        { timeout: 10000 }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.data.message });
        // If code is invalid, go back to step 2
        if (response.data.message.includes('verification code') || response.data.message.includes('Invalid')) {
          setStep(2);
          setCode('');
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset password. Please try again.' 
      });
      // Go back to code entry if verification fails
      if (error.response?.data?.message?.includes('verification code')) {
        setStep(2);
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-[10000]"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md w-[90%] relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
              {step === 1 && <FaEnvelope />}
              {step === 2 && <FaKey />}
              {step === 3 && <FaLock />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 && 'Sending Verification Code'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Set New Password'}
            </h2>
            <p className="text-sm text-gray-600">
              {step === 1 && 'Sending code to your email...'}
              {step === 2 && 'Check your email for the 6-digit code'}
              {step === 3 && 'Enter your new password'}
            </p>
          </div>

          {/* Step 1: Sending Code */}
          {step === 1 && (
            <div className="text-center py-8">
              {loading && (
                <div className="space-y-4">
                  <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto" />
                  <p className="text-gray-600">Sending verification code...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Enter Code */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 text-3xl text-center font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                  autoFocus
                />
                {countdown > 0 && (
                  <p className="text-center text-sm text-red-600 mt-2">
                    Code expires in: {formatCountdown(countdown)}
                  </p>
                )}
              </div>

              {message.text && (
                <motion.div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.type === 'success' ? (
                    <FaCheckCircle />
                  ) : (
                    <FaExclamationTriangle />
                  )}
                  <span className="text-sm">{message.text}</span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || countdown > 540}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Resend Code
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    required
                    disabled={loading}
                    minLength={8}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                    minLength={8}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {message.text && (
                <motion.div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.type === 'success' ? (
                    <FaCheckCircle />
                  ) : (
                    <FaExclamationTriangle />
                  )}
                  <span className="text-sm">{message.text}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminPasswordResetModal;

