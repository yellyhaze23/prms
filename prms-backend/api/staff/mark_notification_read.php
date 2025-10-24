<?php
require_once __DIR__ . '/_init.php';
header('Content-Type: application/json');

$user = current_user_or_401();

// Ensure user is staff
if ($user['role'] !== 'staff') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    global $conn;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $notificationId = $input['notification_id'] ?? null;
    $markAll = $input['mark_all'] ?? false;

    if ($markAll) {
        // Mark all notifications as read for this staff user
        $sql = "UPDATE notifications SET is_read = 1, updated_at = NOW() WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user['id']);
        $stmt->execute();
        
        $affectedRows = $stmt->affected_rows;
        
        echo json_encode([
            'success' => true,
            'message' => "Marked {$affectedRows} notifications as read"
        ], JSON_PRETTY_PRINT);
        
    } elseif ($notificationId) {
        // Mark specific notification as read (ensure it belongs to this user)
        $sql = "UPDATE notifications SET is_read = 1, updated_at = NOW() 
                WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $notificationId, $user['id']);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
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
            'error' => 'Notification ID or mark_all parameter required'
        ], JSON_PRETTY_PRINT);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

