import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTrashAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const StaffNotificationDrawer = ({ isOpen, onClose, userId }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const drawerRef = useRef(null);

  // Fetch all notifications
  const fetchAllNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/staff/get_notifications.php?limit=50`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/staff/mark_notification_read.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            notification_id: notificationId
          })
        }
      );
      
      const data = await response.json();
      if (data.success) {
        // Refresh notifications from server
        await fetchAllNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/staff/mark_notification_read.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            mark_all_read: true
          })
        }
      );
      
      const data = await response.json();
      if (data.success) {
        // Refresh notifications from server
        await fetchAllNotifications();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle action button click
  const handleActionClick = (notification) => {
    if (notification.action_url) {
      // Mark as read before navigating
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
      
      // Navigate to the action URL within staff portal
      if (notification.action_url.startsWith('/')) {
        // Close drawer before navigation
        handleClose();
        // Use React Router for internal navigation (add /staff prefix)
        navigate('/staff' + notification.action_url);
      } else {
        // External URL - open in new tab
        window.open(notification.action_url, '_blank');
      }
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 300);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    
    switch (type) {
      case 'urgent':
        return <FaExclamationCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <FaExclamationCircle className={`${iconClass} text-yellow-500`} />;
      case 'success':
        return <FaCheckCircle className={`${iconClass} text-green-500`} />;
      case 'info':
        return <FaInfoCircle className={`${iconClass} text-blue-500`} />;
      default:
        return <FaBell className={`${iconClass} text-gray-500`} />;
    }
  };

  // Format notification time
  const formatTime = (createdAt) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchAllNotifications();
    }
  }, [isOpen, userId]);

  // Handle body scroll prevention
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes slideInFromRight {
            0% {
              opacity: 0;
              transform: translateX(20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideOutToRight {
            0% {
              opacity: 1;
              transform: translateX(0);
            }
            100% {
              opacity: 0;
              transform: translateX(20px);
            }
          }
          
          /* Hide scrollbar but keep functionality */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
        `}
      </style>
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen && !isAnimating ? 'bg-opacity-60 opacity-100' : 'bg-opacity-0 opacity-0'
        }`}
        style={{ zIndex: 999999 }}
        onMouseDown={handleClose}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen && !isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}
        style={{ zIndex: 9999999 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 border-b border-gray-200 bg-gray-50"
          style={{
            animation: isOpen && !isAnimating ? 'slideInFromRight 0.3s ease-out forwards' : 
                      isAnimating ? 'slideOutToRight 0.3s ease-in forwards' : 'none'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBell className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
                <p className="text-sm text-gray-500">{notifications.length} total notifications</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          {unreadCount > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {unreadCount} unread notifications
              </span>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Mark all read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FaBell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm">You'll see notifications here when they arrive</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-all duration-300 ${
                    notification.is_read ? 'bg-gray-50' : 'bg-white'
                  }`}
                  style={{
                    animationDelay: isAnimating ? '0ms' : `${index * 50}ms`,
                    animation: isOpen && !isAnimating ? 'slideInFromRight 0.4s ease-out forwards' : 
                              isAnimating ? 'slideOutToRight 0.3s ease-in forwards' : 'none'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          notification.is_read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        notification.is_read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {notification.action_text && (
                            <button
                              onClick={() => handleActionClick(notification)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              {notification.action_text}
                            </button>
                          )}
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t border-gray-200 bg-gray-50"
          style={{
            animation: isOpen && !isAnimating ? 'slideInFromRight 0.4s ease-out forwards' : 
                      isAnimating ? 'slideOutToRight 0.3s ease-in forwards' : 'none'
          }}
        >
          <div className="text-center text-sm text-gray-500">
            {notifications.length > 0 ? (
              <p>Showing {notifications.length} notifications</p>
            ) : (
              <p>No notifications available</p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default StaffNotificationDrawer;


