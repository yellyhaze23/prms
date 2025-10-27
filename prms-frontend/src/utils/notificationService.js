import axios from 'axios';

class NotificationService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/prms-backend';
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      const response = await axios.post(`${this.baseURL}/create_notification.php`, {
        user_id: notificationData.userId || 1,
        type: notificationData.type || 'info',
        title: notificationData.title,
        message: notificationData.message,
        action_url: notificationData.actionUrl || null,
        action_text: notificationData.actionText || null,
        expires_at: notificationData.expiresAt || null
      });

      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getNotifications(userId = 1, options = {}) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        limit: options.limit || 20,
        offset: options.offset || 0
      });

      if (options.unreadOnly) {
        params.append('unread_only', 'true');
      }

      const response = await axios.get(`${this.baseURL}/get_notifications.php?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId = 1) {
    try {
      const response = await axios.post(`${this.baseURL}/mark_notification_read.php`, {
        notification_id: notificationId,
        user_id: userId
      });

      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId = 1) {
    try {
      const response = await axios.post(`${this.baseURL}/mark_notification_read.php`, {
        mark_all_read: true,
        user_id: userId
      });

      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  // Helper methods for common notification types
  async notifyPatientAdded(patientName, userId = 1) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'New Patient Added',
      message: `Patient ${patientName} has been successfully registered.`,
      actionUrl: '/patient',
      actionText: 'View Patients'
    });
  }

  async notifyPatientUpdated(patientName, userId = 1) {
    return this.createNotification({
      userId,
      type: 'info',
      title: 'Patient Updated',
      message: `Patient ${patientName}'s information has been updated.`,
      actionUrl: '/patient',
      actionText: 'View Patients'
    });
  }

  async notifyPatientDeleted(patientName, userId = 1) {
    return this.createNotification({
      userId,
      type: 'warning',
      title: 'Patient Deleted',
      message: `Patient ${patientName} has been removed from the system.`,
      actionUrl: '/patient',
      actionText: 'View Patients'
    });
  }

  async notifyMedicalRecordUpdated(patientName, userId = 1) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'Medical Record Updated',
      message: `Medical record for ${patientName} has been updated successfully.`,
      actionUrl: '/records',
      actionText: 'View Records'
    });
  }

  async notifyForecastGenerated(diseaseName, userId = 1) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'Forecast Generated',
      message: `ARIMA forecast for ${diseaseName} has been completed successfully.`,
      actionUrl: '/arima-forecast',
      actionText: 'View Forecast'
    });
  }

  async notifyOutbreakAlert(diseaseName, caseCount, userId = 1) {
    return this.createNotification({
      userId,
      type: 'urgent',
      title: 'Outbreak Alert',
      message: `High number of ${diseaseName} cases detected: ${caseCount} cases this week.`,
      actionUrl: '/reports',
      actionText: 'View Reports'
    });
  }

  async notifySystemMaintenance(startTime, userId = 1) {
    return this.createNotification({
      userId,
      type: 'warning',
      title: 'System Maintenance',
      message: `Scheduled maintenance will begin at ${startTime}. Please save your work.`,
      actionUrl: '/',
      actionText: 'View Dashboard'
    });
  }

  async notifyBackupCompleted(userId = 1) {
    return this.createNotification({
      userId,
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily database backup has been completed successfully.',
      actionUrl: '/settings',
      actionText: 'View Settings'
    });
  }

  async notifyBackupFailed(userId = 1) {
    return this.createNotification({
      userId,
      type: 'error',
      title: 'Backup Failed',
      message: 'Daily database backup failed. Please check system logs.',
      actionUrl: '/settings',
      actionText: 'Check Settings'
    });
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;

