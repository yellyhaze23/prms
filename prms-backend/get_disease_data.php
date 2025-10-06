<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$disease = $_GET['disease'] ?? '';

if (empty($disease)) {
    http_response_code(400);
    echo json_encode(['error' => 'Disease parameter is required']);
    exit;
}

// Validate disease parameter
$validDiseases = ['chickenpox', 'measles', 'tuberculosis', 'hepatitis', 'dengue'];
if (!in_array($disease, $validDiseases)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid disease parameter']);
    exit;
}

try {
    // Get disease statistics from health_examinations table
    $sql = "
        SELECT 
            COUNT(*) as total_cases,
            SUM(CASE WHEN h.previous_illness LIKE ? THEN 1 ELSE 0 END) as active_cases,
            SUM(CASE WHEN h.previous_illness NOT LIKE ? AND h.previous_illness IS NOT NULL AND h.previous_illness != '' THEN 1 ELSE 0 END) as recovered_cases,
            SUM(CASE WHEN h.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND h.previous_illness LIKE ? THEN 1 ELSE 0 END) as new_cases_7d
        FROM patients p
        LEFT JOIN health_examinations h ON p.id = h.patient_id
    ";
    
    $diseasePattern = "%{$disease}%";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $diseasePattern, $diseasePattern, $diseasePattern);
    $stmt->execute();
    $result = $stmt->get_result();
    $stats = $result->fetch_assoc();
    
    // Calculate risk level based on active cases and trend
    $activeCases = (int)$stats['active_cases'];
    $newCases = (int)$stats['new_cases_7d'];
    
    $riskLevel = 'low';
    if ($activeCases > 20 || $newCases > 5) {
        $riskLevel = 'high';
    } elseif ($activeCases > 10 || $newCases > 2) {
        $riskLevel = 'moderate';
    }
    
    // Determine trend (simplified - in real implementation, you'd analyze historical data)
    $trend = 'stable';
    if ($newCases > 3) {
        $trend = 'increasing';
    } elseif ($newCases === 0 && $activeCases < 5) {
        $trend = 'decreasing';
    }
    
    // Get last outbreak date (most recent case)
    $lastOutbreakSql = "
        SELECT MAX(h.created_at) as last_outbreak
        FROM health_examinations h
        WHERE h.previous_illness LIKE ?
    ";
    $stmt2 = $conn->prepare($lastOutbreakSql);
    $stmt2->bind_param("s", $diseasePattern);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    $lastOutbreak = $result2->fetch_assoc();
    
    $response = [
        'totalCases' => (int)$stats['total_cases'],
        'activeCases' => $activeCases,
        'recovered' => (int)$stats['recovered_cases'],
        'newCases' => $newCases,
        'riskLevel' => $riskLevel,
        'trend' => $trend,
        'lastOutbreak' => $lastOutbreak['last_outbreak'] ? date('Y-m-d', strtotime($lastOutbreak['last_outbreak'])) : null
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
