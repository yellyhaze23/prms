<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();
$staffId = intval($user['id']);

$from = $_GET['from'] ?? null;
$to = $_GET['to'] ?? null;
$disease = $_GET['disease'] ?? null;
$status = $_GET['status'] ?? null;

// Build WHERE clause for date filtering
$dateWhere = '';
if ($from && $to) {
    $dateWhere = "AND DATE(created_at) BETWEEN '$from' AND '$to'";
} elseif ($from) {
    $dateWhere = "AND DATE(created_at) >= '$from'";
} elseif ($to) {
    $dateWhere = "AND DATE(created_at) <= '$to'";
}

// Get total patients assigned to this staff member
$totalPatientsQuery = "SELECT COUNT(*) as total FROM patients WHERE added_by = $staffId $dateWhere";
$totalResult = $conn->query($totalPatientsQuery);
$totalPatients = $totalResult ? intval($totalResult->fetch_assoc()['total']) : 0;

// Get infected patients (those with medical records containing diagnoses)
$infectedQuery = "SELECT COUNT(DISTINCT p.id) as infected 
                  FROM patients p 
                  INNER JOIN medical_records mr ON p.id = mr.patient_id 
                  WHERE p.added_by = $staffId 
                  AND mr.diagnosis IS NOT NULL 
                  AND mr.diagnosis != '' 
                  AND mr.diagnosis != 'Healthy'
                  $dateWhere";
$infectedResult = $conn->query($infectedQuery);
$infectedPatients = $infectedResult ? intval($infectedResult->fetch_assoc()['infected']) : 0;

// Get healthy patients (those without diagnoses or with 'Healthy' diagnosis)
$healthyPatients = $totalPatients - $infectedPatients;

// Get patient details with optional filtering
$patientQuery = "SELECT p.id, p.full_name, p.age, p.sex, p.address, p.created_at,
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM medical_records mr 
                                WHERE mr.patient_id = p.id 
                                AND mr.diagnosis IS NOT NULL 
                                AND mr.diagnosis != '' 
                                AND mr.diagnosis != 'Healthy'
                            ) THEN 'infected'
                            ELSE 'healthy'
                        END as status
                 FROM patients p 
                 WHERE p.added_by = $staffId $dateWhere";

// Add disease filtering if specified
if ($disease) {
    $patientQuery .= " AND EXISTS (
        SELECT 1 FROM medical_records mr 
        WHERE mr.patient_id = p.id 
        AND mr.diagnosis = '$disease'
    )";
}

// Add status filtering if specified
if ($status) {
    if ($status === 'healthy') {
        $patientQuery .= " AND NOT EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.patient_id = p.id 
            AND mr.diagnosis IS NOT NULL 
            AND mr.diagnosis != '' 
            AND mr.diagnosis != 'Healthy'
        )";
    } elseif ($status === 'infected') {
        $patientQuery .= " AND EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.patient_id = p.id 
            AND mr.diagnosis IS NOT NULL 
            AND mr.diagnosis != '' 
            AND mr.diagnosis != 'Healthy'
        )";
    }
}

$patientQuery .= " ORDER BY p.created_at DESC LIMIT 100";

$patientResult = $conn->query($patientQuery);
$patients = [];
if ($patientResult) {
    while ($row = $patientResult->fetch_assoc()) {
        $patients[] = $row;
    }
}

json_ok([
    'summary' => [
        'total_patients' => $totalPatients,
        'infected_patients' => $infectedPatients,
        'healthy_patients' => $healthyPatients,
    ],
    'patients' => $patients,
    'filters' => compact('from', 'to', 'disease', 'status'),
]);
