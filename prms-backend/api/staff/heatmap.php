<?php
require_once __DIR__ . '/_init.php';

header('Content-Type: application/json');

$user = current_user_or_401();
$staffId = intval($user['id']);

// Aggregate barangay-level stats but only for patients assigned to this staff (patients.added_by = staffId)
$sql = "SELECT 
    b.id,
    b.name as barangay,
    b.latitude,
    b.longitude,
    COUNT(DISTINCT p.id) as total_patients,
    COUNT(DISTINCT CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN p.id END) as sick_patients,
    ROUND(
        (COUNT(DISTINCT CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN p.id END) / NULLIF(COUNT(DISTINCT p.id), 0)) * 100, 2
    ) as sick_rate,
    COUNT(DISTINCT CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN mr.diagnosis END) as disease_types,
    GROUP_CONCAT(DISTINCT CASE WHEN mr.diagnosis IS NOT NULL AND mr.diagnosis != '' THEN mr.diagnosis END ORDER BY mr.diagnosis SEPARATOR ', ') as diseases
FROM barangays b
LEFT JOIN patients p ON p.barangay_id = b.id AND p.added_by = $staffId
LEFT JOIN medical_records mr ON p.id = mr.patient_id
WHERE b.latitude IS NOT NULL AND b.longitude IS NOT NULL
GROUP BY b.id, b.name, b.latitude, b.longitude
HAVING COUNT(DISTINCT p.id) > 0
ORDER BY total_patients DESC";

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
    exit;
}

$heatmapData = [];
$totalPatients = 0;
$totalSick = 0;

while ($row = $result->fetch_assoc()) {
    // Coalesce nulls to sensible defaults
    $row['total_patients'] = intval($row['total_patients'] ?? 0);
    $row['sick_patients'] = intval($row['sick_patients'] ?? 0);
    $row['sick_rate'] = floatval($row['sick_rate'] ?? 0);
    $row['disease_types'] = intval($row['disease_types'] ?? 0);
    $row['diseases'] = $row['diseases'] ?? '';
    $heatmapData[] = $row;
    $totalPatients += $row['total_patients'];
    $totalSick += $row['sick_patients'];
}

$overallSickRate = $totalPatients > 0 ? round(($totalSick / $totalPatients) * 100, 2) : 0;

echo json_encode([
    'success' => true,
    'data' => $heatmapData,
    'summary' => [
        'total_barangays' => count($heatmapData),
        'total_patients' => $totalPatients,
        'total_sick' => $totalSick,
        'overall_sick_rate' => $overallSickRate,
    ],
]);


