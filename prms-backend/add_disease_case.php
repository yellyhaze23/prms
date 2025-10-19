<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (
    !isset($data['patient_id']) || empty($data['patient_id']) ||
    !isset($data['disease']) || empty($data['disease']) ||
    !isset($data['onset_date']) || empty($data['onset_date'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: Patient ID, Disease, and Onset Date are required.']);
    exit;
}

// Validate disease - check against database diseases
$checkDisease = "SELECT id FROM diseases WHERE name = ?";
$stmt = $conn->prepare($checkDisease);
$stmt->bind_param("s", $data['disease']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid disease type.']);
    exit;
}
$stmt->close();


try {
    // Get input data without escaping (prepared statements will handle it)
    $patient_id = (int)$data['patient_id'];
    $disease = $data['disease'];
    $onset_date = $data['onset_date'];
    $diagnosis_date = $data['diagnosis_date'] ?? '';
    $symptoms = $data['symptoms'] ?? '';
    $treatment = $data['treatment'] ?? '';
    $medical_advice = $data['medical_advice'] ?? '';
    $notes = $data['notes'] ?? '';
    $reported_by = $data['reported_by'] ?? '';
    $reported_date = $data['reported_date'] ?? date('Y-m-d');

    // Check if patient exists using prepared statement
    $checkPatient = $conn->prepare("SELECT id FROM patients WHERE id = ?");
    $checkPatient->bind_param("i", $patient_id);
    $checkPatient->execute();
    $result = $checkPatient->get_result();
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Patient not found.']);
        exit;
    }

    // Insert disease case into medical_records table
    $sql = "INSERT INTO medical_records 
                (patient_id, diagnosis, onset_date, diagnosis_date, symptoms, treatment, medical_advice, notes, reported_by, reported_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                diagnosis = VALUES(diagnosis),
                onset_date = VALUES(onset_date),
                diagnosis_date = VALUES(diagnosis_date),
                symptoms = VALUES(symptoms),
                treatment = VALUES(treatment),
                medical_advice = VALUES(medical_advice),
                notes = VALUES(notes),
                reported_by = VALUES(reported_by),
                reported_date = VALUES(reported_date),
                updated_at = NOW()";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issssssss", 
        $patient_id,
        $disease, 
        $onset_date, 
        $diagnosis_date, 
        $symptoms, 
        $treatment, 
        $medical_advice, 
        $notes, 
        $reported_by, 
        $reported_date
    );

    if ($stmt->execute()) {
        // Get updated patient data using prepared statement
        $getPatient = $conn->prepare("SELECT p.*, mr.diagnosis, mr.onset_date, mr.diagnosis_date, mr.symptoms, mr.treatment, mr.medical_advice, mr.notes, mr.reported_by, mr.reported_date
                      FROM patients p 
                      LEFT JOIN medical_records mr ON p.id = mr.patient_id 
                      WHERE p.id = ?");
        $getPatient->bind_param("i", $patient_id);
        $getPatient->execute();
        $patientResult = $getPatient->get_result();
        $patientData = $patientResult->fetch_assoc();

        echo json_encode([
            'success' => true,
            'message' => 'Disease case added successfully',
            'patient' => $patientData
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $stmt->error]);
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
