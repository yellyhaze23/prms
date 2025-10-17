<?php
// Auto-generate notifications script
// This should be called by a cron job every hour
require_once 'notification_service.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $notificationService = new NotificationService($conn);
    
    // Generate notifications for all users
    $notificationService->autoGenerateNotifications();
    
    // Clean up old notifications (older than 30 days)
    $cleaned = $notificationService->cleanupOldNotifications(30);
    
    // Log the activity
    error_log("Notifications generated at " . date('Y-m-d H:i:s') . " - Cleaned {$cleaned} old notifications");
    
    echo "Notifications generated successfully at " . date('Y-m-d H:i:s') . "\n";
    
} catch (PDOException $e) {
    error_log("Error generating notifications: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?>
