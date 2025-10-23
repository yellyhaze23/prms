<?php
require_once __DIR__ . '/_init.php';

header('Content-Type: application/json');

$user = current_user_or_401();

try {
    // Get all barangays with coordinates
    $sql = "SELECT id, name, latitude, longitude FROM barangays ORDER BY name";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database error: ' . $conn->error);
    }
    
    $barangays = [];
    while ($row = $result->fetch_assoc()) {
        $barangays[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'latitude' => $row['latitude'] ? (float)$row['latitude'] : null,
            'longitude' => $row['longitude'] ? (float)$row['longitude'] : null
        ];
    }
    
    json_ok($barangays);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

