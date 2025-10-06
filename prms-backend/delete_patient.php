<?php
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = (int)($data['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing patient ID']);
    exit;
}

$sql = "DELETE FROM patients WHERE id = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
}
