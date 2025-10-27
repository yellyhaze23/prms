import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffSessionWarningModal from './StaffSessionWarningModal';

const StaffSessionManager = ({ children }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [warningTime, setWarningTime] = useState(5);
  const navigate = useNavigate();

  // Activity detection
  const resetTimer = useCallback(async () => {
    setIsActive(true);
    setShowWarning(false);
    setTimeRemaining(null);
    
    // Update session activity on the server
    try {
      await fetch('http://localhost/prms-backend/update_session_activity.php', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, []);

  // Check session status
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('http://localhost/prms-backend/check_session.php', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!data.success) {
        if (data.expired) {
          // Session expired, logout
          console.log('Session expired, logging out...');
          sessionStorage.removeItem("isLoggedIn");
          localStorage.removeItem("sidebarCollapsed");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          
          // Dispatch logout event for cleanup
          window.dispatchEvent(new CustomEvent('logout'));
          
          // Navigate to login page
          navigate("/", { replace: true });
          window.location.reload();
          return;
        }
      }
      
      if (data.timeRemaining !== undefined) {
        setTimeRemaining(data.timeRemaining);
        setWarningTime(data.warningTime || 5);
        
        // Show warning when time is up, but don't hide it immediately to prevent flickering
        if (data.shouldWarn && data.timeRemaining > 0) {
          setShowWarning(true);
        } else if (!data.shouldWarn && data.timeRemaining > 1) {
          // Only hide warning if we have more than 1 minute left
          setShowWarning(false);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // Don't logout on error, just continue
    }
  }, [navigate]);

  // Activity event listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
    
    const handleActivity = () => {
      if (isActive) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isActive, resetTimer]);

  // Session check interval
  useEffect(() => {
    // Delay initial check significantly to allow session to be fully established
    // Staff users need more time for session propagation
    const initialTimeout = setTimeout(() => {
      console.log('StaffSessionManager: Starting session checks');
      checkSession();
    }, 30000); // Wait 30 seconds after login before first check
    
    // Use a fixed interval to prevent flickering
    const interval = setInterval(checkSession, 60000); // Check every 60 seconds
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkSession]);

  // Warning countdown
  useEffect(() => {
    if (showWarning && timeRemaining > 0) {
      const countdown = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0.1) { // Less than 0.1 minutes (6 seconds)
            setShowWarning(false);
            clearInterval(countdown);
            return 0;
          }
          return prev - 1; // Update every minute
        });
      }, 60000); // Update every 60 seconds

      return () => clearInterval(countdown);
    }
  }, [showWarning, timeRemaining]);

  const handleExtendSession = () => {
    resetTimer();
    // Trigger a session check to update the backend
    checkSession();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sidebarCollapsed");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    // Dispatch logout event for cleanup
    window.dispatchEvent(new CustomEvent('logout'));
    
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <>
      {children}
      {showWarning && (
        <StaffSessionWarningModal 
          timeRemaining={timeRemaining}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default StaffSessionManager;


