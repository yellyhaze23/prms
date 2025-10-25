<?php
// Add CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/_init.php';
$user = current_user_or_401();
$staffId = intval($user['id']);

$days = $_GET['days'] ?? null;
$disease = $_GET['disease'] ?? null;

// Build date condition for filtering - exclude future dates
$mrDateCondition = 'DATE(mr.created_at) <= CURDATE()';
$subDateCondition = 'DATE(created_at) <= CURDATE()';
if ($days && $days !== 'all') {
    $mrDateCondition = "DATE(mr.created_at) >= DATE_SUB(NOW(), INTERVAL $days DAY) AND DATE(mr.created_at) <= CURDATE()";
    $subDateCondition = "DATE(created_at) >= DATE_SUB(NOW(), INTERVAL $days DAY) AND DATE(created_at) <= CURDATE()";
}

// Get total patients assigned to this staff member with medical records in date range
$totalPatientsQuery = "SELECT COUNT(DISTINCT p.id) as total 
                       FROM patients p 
                       INNER JOIN medical_records mr ON p.id = mr.patient_id 
                       WHERE p.added_by = $staffId AND $mrDateCondition";
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
                  AND $mrDateCondition";
$infectedResult = $conn->query($infectedQuery);
$infectedPatients = $infectedResult ? intval($infectedResult->fetch_assoc()['infected']) : 0;

// Get healthy patients (those without diagnoses or with 'Healthy' diagnosis)
$healthyPatients = $totalPatients - $infectedPatients;

// Get patient details with optional filtering - based on medical record dates
$patientQuery = "SELECT p.id, p.full_name, p.age, p.sex, p.address, p.created_at,
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM medical_records mr2 
                                WHERE mr2.patient_id = p.id 
                                AND mr2.diagnosis IS NOT NULL 
                                AND mr2.diagnosis != '' 
                                AND mr2.diagnosis != 'Healthy'
                                AND $subDateCondition
                            ) THEN 'infected'
                            ELSE 'healthy'
                        END as status,
                        (SELECT MAX(mr3.updated_at) 
                         FROM medical_records mr3 
                         WHERE mr3.patient_id = p.id 
                         AND $subDateCondition) as last_visit_date
                 FROM patients p 
                 WHERE p.added_by = $staffId 
                 AND EXISTS (
                     SELECT 1 FROM medical_records mr 
                     WHERE mr.patient_id = p.id 
                     AND $subDateCondition
                 )";

// Add disease filtering if specified
if ($disease) {
    $patientQuery .= " AND EXISTS (
        SELECT 1 FROM medical_records mr 
        WHERE mr.patient_id = p.id 
        AND mr.diagnosis = '$disease'
        AND $subDateCondition
    )";
}

$patientQuery .= " ORDER BY last_visit_date DESC LIMIT 100";

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
    'filters' => compact('days', 'disease'),
]);
