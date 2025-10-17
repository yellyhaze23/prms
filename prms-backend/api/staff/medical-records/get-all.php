<?php
// Start session BEFORE any headers
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../_init.php';

if (!headers_sent()) {
    header('Content-Type: application/json');
}

$user = current_user_or_401();
$staffId = intval($user['id']);

$patientId = intval($_GET['patient_id'] ?? 0);

if ($patientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid patient ID']);
    exit;
}

// Verify that the patient belongs to this staff member
$checkSql = "SELECT id FROM patients WHERE id = ? AND added_by = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("ii", $patientId, $staffId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Patient not found or access denied']);
    exit;
}

// Get all medical records for this patient (consultation history)
$sql = "SELECT 
        mr.id as medical_record_id,
        mr.surname,
        mr.first_name,
        mr.middle_name,
        mr.suffix,
        mr.date_of_birth,
        mr.barangay,
        mr.philhealth_id,
        mr.priority,
        mr.blood_pressure,
        mr.temperature,
        mr.height,
        mr.weight,
        mr.chief_complaint,
        mr.place_of_consultation,
        mr.type_of_services,
        mr.date_of_consultation,
        mr.health_provider,
        mr.diagnosis,
        mr.laboratory_procedure,
        mr.prescribed_medicine,
        mr.medical_advice,
        mr.medical_remarks,
        mr.treatment,
        mr.created_at,
        mr.updated_at
        FROM medical_records mr
        WHERE mr.patient_id = ?
        ORDER BY mr.date_of_consultation DESC, mr.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $patientId);
$stmt->execute();
$result = $stmt->get_result();

$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = $row;
}

echo json_encode($records);
?>
