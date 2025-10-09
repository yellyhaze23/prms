<?php
require 'cors.php';
require 'config.php';

$patient_id = isset($_GET['patient_id']) ? intval($_GET['patient_id']) : 0;

if ($patient_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid patient_id.']);
    exit;
}

// Get ALL medical records for patient (not just latest)
// Use only essential columns that exist in the database
$stmt = $conn->prepare("
    SELECT mr.id as medical_record_id, mr.patient_id, mr.surname, mr.first_name, mr.middle_name, mr.suffix,
           mr.diagnosis, mr.date_of_consultation, mr.chief_complaint, mr.health_provider, 
           mr.prescribed_medicine, mr.medical_advice, mr.blood_pressure, mr.temperature, 
           mr.height, mr.weight, mr.created_at, mr.updated_at,
           p.sex, p.full_name, p.age, p.address
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    WHERE mr.patient_id = ?
    ORDER BY mr.date_of_consultation DESC, mr.created_at DESC
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

$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = $row;
}

echo json_encode($records);
?>
