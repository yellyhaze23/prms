<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents('php://input'), true);
    
    $notificationId = $input['notification_id'] ?? null;
    $userId = $input['user_id'] ?? 1;
    $markAllRead = $input['mark_all_read'] ?? false;

    if ($markAllRead) {
        // Mark all notifications as read for user
        $sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $affectedRows = $stmt->rowCount();
        
        echo json_encode([
            'success' => true,
            'message' => "Marked {$affectedRows} notifications as read"
        ], JSON_PRETTY_PRINT);
        
    } elseif ($notificationId) {
        // Mark specific notification as read
        $sql = "UPDATE notifications SET is_read = TRUE WHERE id = :notification_id AND user_id = :user_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':notification_id', $notificationId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Notification marked as read'
            ], JSON_PRETTY_PRINT);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Notification not found or already read'
            ], JSON_PRETTY_PRINT);
        }
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Notification ID or mark_all_read parameter required'
        ], JSON_PRETTY_PRINT);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
