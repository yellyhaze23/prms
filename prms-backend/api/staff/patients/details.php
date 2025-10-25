<?php
// Start session BEFORE any headers
if (session_status() === PHP_SESSION_NONE) {
    session_name('STAFFSESSID');
    session_start();
}

require_once __DIR__ . '/../../_init.php';

header('Content-Type: application/json');
$user = current_user_or_401();
$staffId = intval($user['id']);

$patientId = intval($_GET['id'] ?? 0);

if ($patientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid patient ID']);
    exit;
}

// Get patient details with medical records
$sql = "SELECT 
        p.*,
        mr.diagnosis,
        mr.chief_complaint,
        mr.health_provider,
        mr.prescribed_medicine,
        mr.medical_advice,
        mr.medical_remarks,
        mr.treatment,
        mr.date_of_consultation,
        mr.created_at as consultation_created_at,
        mr.updated_at as consultation_updated_at
        FROM patients p
        LEFT JOIN (
            SELECT 
                patient_id,
                diagnosis,
                chief_complaint,
                health_provider,
                prescribed_medicine,
                medical_advice,
                medical_remarks,
                treatment,
                date_of_consultation,
                created_at,
                updated_at,
                ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY updated_at DESC) as rn
            FROM medical_records
        ) mr ON p.id = mr.patient_id AND mr.rn = 1
        WHERE p.id = ? AND p.added_by = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $patientId, $staffId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Patient not found or access denied']);
    exit;
}

$patient = $result->fetch_assoc();

// Calculate age if date_of_birth is available
if ($patient['date_of_birth']) {
    $birthDate = new DateTime($patient['date_of_birth']);
    $today = new DateTime();
    $patient['calculated_age'] = $today->diff($birthDate)->y;
} else {
    $patient['calculated_age'] = $patient['age'];
}

echo json_encode(['success' => true, 'data' => $patient]);
?>
