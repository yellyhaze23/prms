<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM diseases WHERE is_active = 1 ORDER BY name ASC";
    $result = $conn->query($sql);
    
    $diseases = [];
    while ($row = $result->fetch_assoc()) {
        $diseases[] = $row;
    }
    
    echo json_encode($diseases);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
