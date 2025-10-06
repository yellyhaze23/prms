<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (
    !isset($data['patient_id']) || empty($data['patient_id']) ||
    !isset($data['disease']) || empty($data['disease']) ||
    !isset($data['onset_date']) || empty($data['onset_date']) ||
    !isset($data['status']) || empty($data['status'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: Patient ID, Disease, Onset Date, and Status are required.']);
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

// Validate status
$validStatuses = ['suspected', 'confirmed', 'recovered', 'quarantined'];
if (!in_array($data['status'], $validStatuses)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status.']);
    exit;
}

try {
    // Sanitize input data
    $patient_id = (int)$data['patient_id'];
    $disease = mysqli_real_escape_string($conn, $data['disease']);
    $onset_date = mysqli_real_escape_string($conn, $data['onset_date']);
    $diagnosis_date = mysqli_real_escape_string($conn, $data['diagnosis_date'] ?? '');
    $severity = mysqli_real_escape_string($conn, $data['severity'] ?? '');
    $status = mysqli_real_escape_string($conn, $data['status']);
    $symptoms = mysqli_real_escape_string($conn, $data['symptoms'] ?? '');
    $treatment = mysqli_real_escape_string($conn, $data['treatment'] ?? '');
    $vaccination_status = mysqli_real_escape_string($conn, $data['vaccination_status'] ?? '');
    $contact_tracing = mysqli_real_escape_string($conn, $data['contact_tracing'] ?? '');
    $notes = mysqli_real_escape_string($conn, $data['notes'] ?? '');
    $reported_by = mysqli_real_escape_string($conn, $data['reported_by'] ?? '');
    $reported_date = mysqli_real_escape_string($conn, $data['reported_date'] ?? date('Y-m-d'));

    // Check if patient exists
    $checkPatient = "SELECT id FROM patients WHERE id = $patient_id";
    $result = $conn->query($checkPatient);
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Patient not found.']);
        exit;
    }

    // Insert disease case into health_examinations table
    $sql = "INSERT INTO health_examinations 
                (patient_id, previous_illness, onset_date, diagnosis_date, severity, status, symptoms, treatment, vaccination_status, contact_tracing, notes, reported_by, reported_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                previous_illness = VALUES(previous_illness),
                onset_date = VALUES(onset_date),
                diagnosis_date = VALUES(diagnosis_date),
                severity = VALUES(severity),
                status = VALUES(status),
                symptoms = VALUES(symptoms),
                treatment = VALUES(treatment),
                vaccination_status = VALUES(vaccination_status),
                contact_tracing = VALUES(contact_tracing),
                notes = VALUES(notes),
                reported_by = VALUES(reported_by),
                reported_date = VALUES(reported_date),
                updated_at = NOW()";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issssssssssss", 
        $patient_id,
        $disease, 
        $onset_date, 
        $diagnosis_date, 
        $severity, 
        $status, 
        $symptoms, 
        $treatment, 
        $vaccination_status, 
        $contact_tracing, 
        $notes, 
        $reported_by, 
        $reported_date
    );

    if ($stmt->execute()) {
        // Get updated patient data
        $getPatient = "SELECT p.*, h.previous_illness, h.onset_date, h.diagnosis_date, h.severity, h.status, h.symptoms, h.treatment, h.vaccination_status, h.contact_tracing, h.notes, h.reported_by, h.reported_date
                      FROM patients p 
                      LEFT JOIN health_examinations h ON p.id = h.patient_id 
                      WHERE p.id = $patient_id";
        $patientResult = $conn->query($getPatient);
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
