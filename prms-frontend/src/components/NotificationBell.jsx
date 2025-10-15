import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaCheck, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTrashAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import NotificationDrawer from './NotificationDrawer';

const NotificationBell = ({ userId = 1 }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/prms/prms-backend/get_notifications.php?user_id=${userId}&limit=10`);
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
      const response = await fetch('http://localhost/prms/prms-backend/mark_notification_read.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          notification_id: notificationId
        })
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: 1 }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost/prms/prms-backend/mark_notification_read.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          mark_all: true
        })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: 1 }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="w-4 h-4 text-red-500" />;
      case 'delete':
        return <FaTrashAlt className="w-4 h-4 text-red-500" />;
      case 'info':
      default:
        return <FaInfoCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  // Handle action button click
  const handleActionClick = (notification, event) => {
    event.stopPropagation(); // Prevent notification click
    if (notification.action_url) {
      // Navigate to the action URL
      if (notification.action_url.startsWith('/')) {
        window.location.href = notification.action_url;
      } else {
        window.open(notification.action_url, '_blank');
      }
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Modern Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[99999] transform -translate-x-4" style={{zIndex: 99999}}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.is_read ? 'bg-gray-50' : 'bg-white'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
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
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.created_at)}
                        </span>
                        {notification.action_text && (
                          <button
                            onClick={(e) => handleActionClick(notification, e)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            {notification.action_text}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsDrawerOpen(true);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Drawer */}
      <NotificationDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userId={userId}
      />
    </div>
  );
};

export default NotificationBell;
