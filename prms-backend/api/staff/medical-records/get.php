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

// Get the latest medical record for this patient
$sql = "SELECT 
        p.id as patient_id,
        p.full_name,
        p.age,
        p.sex,
        p.date_of_birth,
        p.address,
        mr.id as medical_record_id,
        mr.surname,
        mr.first_name,
        mr.middle_name,
        mr.suffix,
        mr.date_of_birth as mr_date_of_birth,
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
        FROM patients p
        LEFT JOIN (
            SELECT 
                patient_id,
                id,
                surname,
                first_name,
                middle_name,
                suffix,
                date_of_birth,
                barangay,
                philhealth_id,
                priority,
                blood_pressure,
                temperature,
                height,
                weight,
                chief_complaint,
                place_of_consultation,
                type_of_services,
                date_of_consultation,
                health_provider,
                diagnosis,
                laboratory_procedure,
                prescribed_medicine,
                medical_advice,
                medical_remarks,
                treatment,
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
    // Return patient basic info if no medical records exist
    $patientSql = "SELECT id, full_name, age, sex, date_of_birth, address FROM patients WHERE id = ? AND added_by = ?";
    $patientStmt = $conn->prepare($patientSql);
    $patientStmt->bind_param("ii", $patientId, $staffId);
    $patientStmt->execute();
    $patientResult = $patientStmt->get_result();
    
    if ($patientResult->num_rows > 0) {
        $patientData = $patientResult->fetch_assoc();
        echo json_encode($patientData);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Patient not found']);
    }
} else {
    $data = $result->fetch_assoc();
    echo json_encode($data);
}
?>
