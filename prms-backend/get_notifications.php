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

    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 1; // Default to user 1 for now
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $unreadOnly = isset($_GET['unread_only']) ? (bool)$_GET['unread_only'] : false;

    // Build query
    $sql = "SELECT * FROM notifications WHERE user_id = :user_id";
    
    if ($unreadOnly) {
        $sql .= " AND is_read = FALSE";
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get unread count
    $countStmt = $conn->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = :user_id AND is_read = FALSE");
    $countStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $countStmt->execute();
    $unreadCount = $countStmt->fetch(PDO::FETCH_ASSOC)['unread_count'];

    // Format timestamps
    foreach ($notifications as &$notification) {
        $notification['created_at'] = date('Y-m-d H:i:s', strtotime($notification['created_at']));
        $notification['updated_at'] = date('Y-m-d H:i:s', strtotime($notification['updated_at']));
        $notification['is_read'] = (bool)$notification['is_read'];
        $notification['expires_at'] = $notification['expires_at'] ? date('Y-m-d H:i:s', strtotime($notification['expires_at'])) : null;
    }

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => (int)$unreadCount,
        'total' => count($notifications)
    ], JSON_PRETTY_PRINT);

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
