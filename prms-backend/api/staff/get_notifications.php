<?php
require_once __DIR__ . '/_init.php';
header('Content-Type: application/json');

$user = current_user_or_401();

// Ensure user is staff
if ($user['role'] !== 'staff') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$unreadOnly = isset($_GET['unread_only']) ? (bool)$_GET['unread_only'] : false;

try {
    global $conn;
    
    // Build query - filter notifications relevant to staff
    $sql = "SELECT * FROM notifications 
            WHERE user_id = ? 
            AND (
                type IN ('success', 'warning', 'urgent')
                OR title LIKE '%Patient%'
                OR title LIKE '%Disease%'
                OR title LIKE '%Outbreak%'
                OR title LIKE '%Medical Record%'
                OR title LIKE '%Assignment%'
            )";
    
    if ($unreadOnly) {
        $sql .= " AND is_read = 0";
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $user['id'], $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    $notifications = $result->fetch_all(MYSQLI_ASSOC);

    // Get unread count
    $countSql = "SELECT COUNT(*) as unread_count FROM notifications 
                 WHERE user_id = ? AND is_read = 0
                 AND (
                     type IN ('success', 'warning', 'urgent')
                     OR title LIKE '%Patient%'
                     OR title LIKE '%Disease%'
                     OR title LIKE '%Outbreak%'
                     OR title LIKE '%Medical Record%'
                     OR title LIKE '%Assignment%'
                 )";
    $countStmt = $conn->prepare($countSql);
    $countStmt->bind_param("i", $user['id']);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $unreadCount = $countResult->fetch_assoc()['unread_count'];

    // Format timestamps
    foreach ($notifications as &$notification) {
        $notification['created_at'] = date('Y-m-d H:i:s', strtotime($notification['created_at']));
        $notification['updated_at'] = date('Y-m-d H:i:s', strtotime($notification['updated_at']));
        $notification['is_read'] = (int)$notification['is_read'];
        $notification['expires_at'] = $notification['expires_at'] ? date('Y-m-d H:i:s', strtotime($notification['expires_at'])) : null;
    }

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => (int)$unreadCount,
        'total' => count($notifications)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

