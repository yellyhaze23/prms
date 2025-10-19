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

// Get input data without escaping (prepared statements will handle it)
$surname = $data['surname'] ?? '';
$first_name = $data['first_name'] ?? '';
$middle_name = $data['middle_name'] ?? '';
$suffix = $data['suffix'] ?? '';
$date_of_birth = $data['date_of_birth'] ?? '';
$philhealth_id = $data['philhealth_id'] ?? '';
$priority = $data['priority'] ?? '';
$blood_pressure = $data['blood_pressure'] ?? '';
$temperature = $data['temperature'] ?? '';
$height = floatval($data['height'] ?? 0);
$weight = floatval($data['weight'] ?? 0);
$chief_complaint = $data['chief_complaint'] ?? '';
$place_of_consultation = $data['place_of_consultation'] ?? '';
$type_of_services = $data['type_of_services'] ?? '';
$date_of_consultation = $data['date_of_consultation'] ?? '';
$health_provider = $data['health_provider'] ?? '';
$diagnosis = $data['diagnosis'] ?? '';
$laboratory_procedure = $data['laboratory_procedure'] ?? '';
$prescribed_medicine = $data['prescribed_medicine'] ?? '';
$medical_advice = $data['medical_advice'] ?? '';
$place_of_consultation_medical = $data['place_of_consultation_medical'] ?? '';
$date_of_consultation_medical = $data['date_of_consultation_medical'] ?? '';
$health_provider_medical = $data['health_provider_medical'] ?? '';
$medical_remarks = $data['medical_remarks'] ?? '';

// Use prepared statement for update
$stmt = $conn->prepare("
    UPDATE medical_records SET
        surname = ?,
        first_name = ?,
        middle_name = ?,
        suffix = ?,
        date_of_birth = ?,
        philhealth_id = ?,
        priority = ?,
        blood_pressure = ?,
        temperature = ?,
        height = ?,
        weight = ?,
        chief_complaint = ?,
        place_of_consultation = ?,
        type_of_services = ?,
        date_of_consultation = ?,
        health_provider = ?,
        diagnosis = ?,
        laboratory_procedure = ?,
        prescribed_medicine = ?,
        medical_advice = ?,
        place_of_consultation_medical = ?,
        date_of_consultation_medical = ?,
        health_provider_medical = ?,
        medical_remarks = ?,
        updated_at = NOW()
    WHERE patient_id = ?
");

$stmt->bind_param("ssssssssddssssssssssssssi", 
    $surname, $first_name, $middle_name, $suffix, $date_of_birth, $philhealth_id, $priority,
    $blood_pressure, $temperature, $height, $weight, $chief_complaint, $place_of_consultation,
    $type_of_services, $date_of_consultation, $health_provider, $diagnosis, $laboratory_procedure,
    $prescribed_medicine, $medical_advice, $place_of_consultation_medical, $date_of_consultation_medical,
    $health_provider_medical, $medical_remarks, $patient_id
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update medical record: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true]);
?>
