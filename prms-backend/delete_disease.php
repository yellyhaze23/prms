<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Disease ID is required.']);
    exit;
}

try {
    $id = (int)$data['id'];

    // Check if disease exists
    $checkSql = "SELECT id FROM diseases WHERE id = $id";
    $checkResult = $conn->query($checkSql);
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Disease not found.']);
        exit;
    }

    // Soft delete (set is_active to false)
    $sql = "UPDATE diseases SET is_active = 0, updated_at = NOW() WHERE id = $id";

    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Disease deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
