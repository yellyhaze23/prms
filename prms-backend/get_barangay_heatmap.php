<?php
require 'cors.php';
require 'config.php';

// Get barangay heatmap data with patient statistics and disease information
$sql = "SELECT 
    b.id,
    b.name as barangay,
    b.latitude,
    b.longitude,
    COUNT(p.id) as total_patients,
    SUM(CASE WHEN mr.diagnosis IS NOT NULL THEN 1 ELSE 0 END) as sick_patients,
    ROUND(
        (SUM(CASE WHEN mr.diagnosis IS NOT NULL THEN 1 ELSE 0 END) / COUNT(p.id)) * 100, 2
    ) as sick_rate,
    COUNT(DISTINCT mr.diagnosis) as disease_types,
    GROUP_CONCAT(DISTINCT mr.diagnosis ORDER BY mr.diagnosis SEPARATOR ', ') as diseases
FROM barangays b
LEFT JOIN patients p ON p.barangay_id = b.id
LEFT JOIN medical_records mr ON p.id = mr.patient_id
WHERE b.latitude IS NOT NULL AND b.longitude IS NOT NULL
GROUP BY b.id, b.name, b.latitude, b.longitude
ORDER BY total_patients DESC";

$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . mysqli_error($conn)]);
    exit;
}

$heatmapData = [];
$totalPatients = 0;
$totalSick = 0;

while ($row = mysqli_fetch_assoc($result)) {
    $heatmapData[] = $row;
    $totalPatients += $row['total_patients'];
    $totalSick += $row['sick_patients'];
}

// Calculate overall statistics
$overallSickRate = $totalPatients > 0 ? round(($totalSick / $totalPatients) * 100, 2) : 0;

$response = [
    'success' => true,
    'data' => $heatmapData,
    'summary' => [
        'total_barangays' => count($heatmapData),
        'total_patients' => $totalPatients,
        'total_sick' => $totalSick,
        'overall_sick_rate' => $overallSickRate
    ]
];

echo json_encode($response);
?>
