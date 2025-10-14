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
    
    $userId = $input['user_id'] ?? 1;
    $type = $input['type'] ?? 'info';
    $title = $input['title'] ?? '';
    $message = $input['message'] ?? '';
    $actionUrl = $input['action_url'] ?? null;
    $actionText = $input['action_text'] ?? null;
    $expiresAt = $input['expires_at'] ?? null;

    // Validate required fields
    if (empty($title) || empty($message)) {
        echo json_encode([
            'success' => false,
            'error' => 'Title and message are required'
        ]);
        exit;
    }

    // Insert notification
    $sql = "INSERT INTO notifications (user_id, type, title, message, action_url, action_text, expires_at) 
            VALUES (:user_id, :type, :title, :message, :action_url, :action_text, :expires_at)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':message', $message);
    $stmt->bindParam(':action_url', $actionUrl);
    $stmt->bindParam(':action_text', $actionText);
    $stmt->bindParam(':expires_at', $expiresAt);
    
    $stmt->execute();
    
    $notificationId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'notification_id' => $notificationId,
        'message' => 'Notification created successfully'
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
