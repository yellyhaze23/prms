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

require_once __DIR__ . '/../_init.php';
$user = current_user_or_401();
$staffId = intval($user['id']);

$days = $_GET['days'] ?? null;
$disease = $_GET['disease'] ?? null;

// Build WHERE clause - exclude future dates
$where = ["p.added_by = $staffId", "DATE(mr.created_at) <= CURDATE()"];
if ($days && $days !== 'all') {
    $where[] = "DATE(mr.created_at) >= DATE_SUB(NOW(), INTERVAL $days DAY)";
}

if ($disease) {
    $where[] = "mr.diagnosis = '$disease'";
}

$whereClause = implode(' AND ', $where);

// Get medical records with patient details
$query = "SELECT 
    mr.id,
    mr.patient_id,
    p.full_name,
    p.age,
    p.sex,
    mr.surname,
    mr.first_name,
    mr.middle_name,
    mr.suffix,
    mr.diagnosis,
    mr.barangay,
    mr.philhealth_id,
    mr.priority,
    mr.created_at as consultation_date,
    mr.updated_at,
    d.name as disease_name
FROM medical_records mr
INNER JOIN patients p ON mr.patient_id = p.id
LEFT JOIN diseases d ON mr.diagnosis = d.name
WHERE $whereClause
ORDER BY mr.created_at DESC
LIMIT 100";

$result = $conn->query($query);
$records = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }
}

// Get summary stats
$summaryQuery = "SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT mr.patient_id) as unique_patients,
    COUNT(DISTINCT mr.diagnosis) as unique_diagnoses
FROM medical_records mr
INNER JOIN patients p ON mr.patient_id = p.id
WHERE $whereClause";

$summaryResult = $conn->query($summaryQuery);
$summary = $summaryResult ? $summaryResult->fetch_assoc() : [
    'total_records' => 0,
    'unique_patients' => 0,
    'unique_diagnoses' => 0
];

json_ok([
    'summary' => $summary,
    'records' => $records
]);

