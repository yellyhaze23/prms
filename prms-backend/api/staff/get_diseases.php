<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM diseases WHERE is_active = 1 ORDER BY name ASC";
    $result = $conn->query($sql);
    
    $diseases = [];
    while ($row = $result->fetch_assoc()) {
        $diseases[] = $row;
    }
    
    json_ok($diseases);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
