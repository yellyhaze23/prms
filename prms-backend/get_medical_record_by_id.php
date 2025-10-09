<?php
require 'cors.php';
require 'config.php';

$record_id = isset($_GET['record_id']) ? intval($_GET['record_id']) : 0;
$patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : 0;

if ($record_id <= 0 || $patient_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid record_id or patient_id.']);
    exit;
}

// Get specific medical record by ID for a patient
$stmt = $conn->prepare("
    SELECT mr.*, p.sex, p.full_name, p.age, p.address
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    WHERE mr.id = ? AND mr.patient_id = ?
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed: ' . mysqli_error($conn)]);
    exit;
}

$stmt->bind_param("ii", $record_id, $patient_id);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . mysqli_error($conn)]);
    exit;
}

$record = $result->fetch_assoc();

if (!$record) {
    http_response_code(404);
    echo json_encode(['error' => 'Medical record not found.']);
    exit;
}

echo json_encode($record);
?>
