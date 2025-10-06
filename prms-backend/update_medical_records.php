<?php
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required patient ID.']);
    exit;
}

$patient_id = intval($data['id']);

$known_illnesses = mysqli_real_escape_string($conn, $data['known_illnesses'] ?? '');

$updateSql = "
    UPDATE medical_records SET
        known_illnesses = '$known_illnesses',
    WHERE patient_id = $patient_id
";

if (!mysqli_query($conn, $updateSql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update medical record: ' . mysqli_error($conn)]);
    exit;
}

echo json_encode(['success' => true]);
?>
