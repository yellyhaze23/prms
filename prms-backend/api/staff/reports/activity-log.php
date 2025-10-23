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

// Build WHERE clause for date
$dateWhere = "p.added_by = $staffId";
if ($days && $days !== 'all') {
    $mrDateWhere = "DATE(mr.created_at) >= DATE_SUB(NOW(), INTERVAL $days DAY)";
    // Patients table doesn't have created_at, use first medical record as proxy
    $pDateWhere = "EXISTS (SELECT 1 FROM medical_records mr2 WHERE mr2.patient_id = p.id AND DATE(mr2.created_at) >= DATE_SUB(NOW(), INTERVAL $days DAY))";
} else {
    $mrDateWhere = "1=1";
    $pDateWhere = "1=1";
}

// Get activity summary
$summaryQuery = "SELECT 
    (SELECT COUNT(*) FROM patients p WHERE p.added_by = $staffId AND $pDateWhere) as patients_added,
    (SELECT COUNT(*) FROM medical_records mr INNER JOIN patients p ON mr.patient_id = p.id WHERE p.added_by = $staffId AND $mrDateWhere) as records_created,
    (SELECT COUNT(*) FROM medical_records mr INNER JOIN patients p ON mr.patient_id = p.id WHERE p.added_by = $staffId AND $mrDateWhere AND mr.created_at != mr.updated_at) as records_updated";

$summaryResult = $conn->query($summaryQuery);
$summary = $summaryResult ? $summaryResult->fetch_assoc() : [
    'patients_added' => 0,
    'records_created' => 0,
    'records_updated' => 0
];

// Get recent activities (using medical records as proxy for patient activity)
$activitiesQuery = "
    SELECT 
        'record_created' as activity_type,
        mr.id as related_id,
        CONCAT(p.full_name, ' - ', COALESCE(mr.diagnosis, 'Record Updated')) as description,
        mr.created_at as activity_date
    FROM medical_records mr
    INNER JOIN patients p ON mr.patient_id = p.id
    WHERE p.added_by = $staffId AND $mrDateWhere
    ORDER BY activity_date DESC
    LIMIT 50";

$result = $conn->query($activitiesQuery);
$activities = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $activities[] = $row;
    }
}

// Get activity by date (for chart) - using medical records
$chartQuery = "SELECT 
    DATE(mr.created_at) as date,
    COUNT(*) as count
FROM medical_records mr
INNER JOIN patients p ON mr.patient_id = p.id
WHERE p.added_by = $staffId AND $mrDateWhere
GROUP BY DATE(mr.created_at)
ORDER BY date DESC
LIMIT 14";

$chartResult = $conn->query($chartQuery);
$activityChart = [];
if ($chartResult) {
    while ($row = $chartResult->fetch_assoc()) {
        $activityChart[] = $row;
    }
}

json_ok([
    'summary' => $summary,
    'activities' => $activities,
    'activity_chart' => $activityChart
]);

