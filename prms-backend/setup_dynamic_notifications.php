<?php
// Setup script to make notifications dynamic
require_once 'config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Clear old static notifications
    $conn->exec("DELETE FROM notifications WHERE user_id = 1");
    
    // Generate dynamic notifications based on current data
    require_once 'notification_service.php';
    $notificationService = new NotificationService($conn);
    
    // Generate notifications for user 1
    $notifications = $notificationService->generateSystemNotifications(1);
    
    $stmt = $conn->prepare("
        INSERT INTO notifications (user_id, type, title, message, action_url, action_text) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $generated = 0;
    foreach ($notifications as $notification) {
        $stmt->execute([
            1, // user_id
            $notification['type'],
            $notification['title'],
            $notification['message'],
            $notification['action_url'],
            $notification['action_text']
        ]);
        $generated++;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Dynamic notifications setup completed',
        'generated_count' => $generated,
        'notifications' => $notifications
    ], JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
