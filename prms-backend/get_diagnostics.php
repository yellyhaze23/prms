<?php
require 'cors.php';
require 'config.php';

$patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : 0;

if ($patient_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid patient_id.']);
    exit;
}

$stmt = $conn->prepare("
    SELECT *
    FROM diagnostics
    WHERE patient_id = ?
    ORDER BY test_date DESC
    LIMIT 1
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed: ' . mysqli_error($conn)]);
    exit;
}

$stmt->bind_param("i", $patient_id);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . mysqli_error($conn)]);
    exit;
}

$diagnostic = $result->fetch_assoc();
echo json_encode($diagnostic ?: []);
?>
