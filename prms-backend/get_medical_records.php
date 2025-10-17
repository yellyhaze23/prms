<?php
require 'cors.php';
require 'config.php';

$patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : 0;

if ($patient_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid patient_id.']);
    exit;
}

// Get all medical record data including patient info
// Use only essential columns that exist in the database
$stmt = $conn->prepare("
    SELECT mr.patient_id, mr.surname, mr.first_name, mr.middle_name, mr.suffix, mr.date_of_birth, 
           mr.philhealth_id, mr.priority, mr.blood_pressure, mr.temperature, mr.height, mr.weight, 
           mr.chief_complaint, mr.place_of_consultation, mr.type_of_services, mr.date_of_consultation, 
           mr.health_provider, mr.diagnosis, mr.laboratory_procedure, mr.prescribed_medicine, 
           mr.medical_advice, mr.place_of_consultation_medical, mr.date_of_consultation_medical, 
           mr.health_provider_medical, mr.medical_remarks, mr.created_at, mr.updated_at,
           p.sex, p.full_name, p.age, p.address
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    WHERE mr.patient_id = ?
    ORDER BY mr.updated_at DESC, mr.created_at DESC
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

$record = $result->fetch_assoc();

echo json_encode($record ?: []);
?>
