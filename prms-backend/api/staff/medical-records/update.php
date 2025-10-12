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

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$patientId = intval($input['patient_id'] ?? 0);

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

// Extract medical record data
$medicalData = [
    'surname' => trim($input['surname'] ?? ''),
    'first_name' => trim($input['first_name'] ?? ''),
    'middle_name' => trim($input['middle_name'] ?? ''),
    'suffix' => trim($input['suffix'] ?? ''),
    'date_of_birth' => trim($input['date_of_birth'] ?? ''),
    'barangay' => trim($input['barangay'] ?? ''),
    'philhealth_id' => trim($input['philhealth_id'] ?? ''),
    'priority' => trim($input['priority'] ?? ''),
    'blood_pressure' => trim($input['blood_pressure'] ?? ''),
    'temperature' => trim($input['temperature'] ?? ''),
    'height' => floatval($input['height'] ?? 0),
    'weight' => floatval($input['weight'] ?? 0),
    'chief_complaint' => trim($input['chief_complaint'] ?? ''),
    'place_of_consultation' => trim($input['place_of_consultation'] ?? ''),
    'type_of_services' => trim($input['type_of_services'] ?? ''),
    'date_of_consultation' => trim($input['date_of_consultation'] ?? ''),
    'health_provider' => trim($input['health_provider'] ?? ''),
    'diagnosis' => trim($input['diagnosis'] ?? ''),
    'laboratory_procedure' => trim($input['laboratory_procedure'] ?? ''),
    'prescribed_medicine' => trim($input['prescribed_medicine'] ?? ''),
    'medical_advice' => trim($input['medical_advice'] ?? ''),
    'medical_remarks' => trim($input['medical_remarks'] ?? ''),
    'treatment' => trim($input['treatment'] ?? '')
];

// Check if there are any critical medical fields with content
$hasCriticalFields = !empty($medicalData['diagnosis']) || 
                    !empty($medicalData['chief_complaint']) || 
                    !empty($medicalData['health_provider']) ||
                    !empty($medicalData['prescribed_medicine']) ||
                    !empty($medicalData['medical_advice']);

if ($hasCriticalFields) {
    // Insert new medical record
    $sql = "INSERT INTO medical_records (
        patient_id, surname, first_name, middle_name, suffix, date_of_birth,
        barangay, philhealth_id, priority, blood_pressure, temperature, height, weight,
        chief_complaint, place_of_consultation, type_of_services, date_of_consultation,
        health_provider, diagnosis, laboratory_procedure, prescribed_medicine,
        medical_advice, medical_remarks, treatment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isssssssssssssssssssssss", 
        $patientId,
        $medicalData['surname'],
        $medicalData['first_name'],
        $medicalData['middle_name'],
        $medicalData['suffix'],
        $medicalData['date_of_birth'],
        $medicalData['barangay'],
        $medicalData['philhealth_id'],
        $medicalData['priority'],
        $medicalData['blood_pressure'],
        $medicalData['temperature'],
        $medicalData['height'],
        $medicalData['weight'],
        $medicalData['chief_complaint'],
        $medicalData['place_of_consultation'],
        $medicalData['type_of_services'],
        $medicalData['date_of_consultation'],
        $medicalData['health_provider'],
        $medicalData['diagnosis'],
        $medicalData['laboratory_procedure'],
        $medicalData['prescribed_medicine'],
        $medicalData['medical_advice'],
        $medicalData['medical_remarks'],
        $medicalData['treatment']
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Medical record updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $stmt->error]);
    }
} else {
    echo json_encode(['success' => true, 'message' => 'No medical data to save']);
}
?>
