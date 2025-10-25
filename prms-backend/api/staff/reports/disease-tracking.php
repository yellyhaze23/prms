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
$where = ["p.added_by = $staffId", "mr.diagnosis IS NOT NULL", "mr.diagnosis != ''", "mr.diagnosis != 'Healthy'", "DATE(mr.created_at) <= CURDATE()"];
if ($days && $days !== 'all') {
    $where[] = "DATE(mr.created_at) >= DATE_SUB(NOW(), INTERVAL $days DAY)";
}

if ($disease) {
    $where[] = "mr.diagnosis = '$disease'";
}

$whereClause = implode(' AND ', $where);

// Get disease statistics
$diseaseStatsQuery = "SELECT 
    mr.diagnosis as disease,
    COUNT(*) as total_cases,
    COUNT(DISTINCT mr.patient_id) as unique_patients,
    AVG(DATEDIFF(NOW(), mr.created_at)) as avg_days_since_diagnosis
FROM medical_records mr
INNER JOIN patients p ON mr.patient_id = p.id
LEFT JOIN diseases d ON mr.diagnosis = d.name
WHERE $whereClause
GROUP BY mr.diagnosis
ORDER BY total_cases DESC";

$result = $conn->query($diseaseStatsQuery);
$diseaseStats = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $diseaseStats[] = $row;
    }
}

// Get timeline data (cases per day/week)
$timelineQuery = "SELECT 
    DATE(mr.created_at) as date,
    mr.diagnosis,
    COUNT(*) as cases
FROM medical_records mr
INNER JOIN patients p ON mr.patient_id = p.id
WHERE $whereClause
GROUP BY DATE(mr.created_at), mr.diagnosis
ORDER BY date DESC
LIMIT 30";

$timelineResult = $conn->query($timelineQuery);
$timeline = [];
if ($timelineResult) {
    while ($row = $timelineResult->fetch_assoc()) {
        $timeline[] = $row;
    }
}

// Get total summary
$totalCases = array_sum(array_column($diseaseStats, 'total_cases'));
$totalDiseases = count($diseaseStats);
$highRiskCases = 0; // Risk level not available in current schema

json_ok([
    'summary' => [
        'total_cases' => $totalCases,
        'total_diseases' => $totalDiseases,
        'high_risk_cases' => $highRiskCases
    ],
    'disease_stats' => $diseaseStats,
    'timeline' => $timeline
]);

