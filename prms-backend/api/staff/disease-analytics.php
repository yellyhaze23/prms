<?php
require_once __DIR__ . '/_init.php';

header('Content-Type: application/json');
$user = current_user_or_401();
$staffId = intval($user['id']);

try {
    // Get top 10 diseases with statistics for this staff member's patients only
    $sql = "
        SELECT 
            mr.diagnosis,
            COUNT(*) as total_cases,
            COUNT(CASE WHEN mr.date_of_consultation >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_cases,
            COUNT(CASE WHEN mr.date_of_consultation >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_cases
        FROM medical_records mr
        INNER JOIN patients p ON mr.patient_id = p.id
        WHERE mr.diagnosis IS NOT NULL 
        AND mr.diagnosis != ''
        AND mr.diagnosis != 'Healthy'
        AND p.added_by = $staffId
        GROUP BY mr.diagnosis
        ORDER BY total_cases DESC
        LIMIT 10
    ";

    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . $conn->error);
    }

    $diseases = [];
    while ($row = $result->fetch_assoc()) {
        $active_cases = (int)$row['active_cases'];
        $total_cases = (int)$row['total_cases'];
        $recent_cases = (int)$row['recent_cases'];
        
        // Calculate risk level based on active cases
        $risk_level = 'Low';
        if ($active_cases >= 10) {
            $risk_level = 'High';
        } elseif ($active_cases >= 5) {
            $risk_level = 'Medium';
        }

        $diseases[] = [
            'disease' => $row['diagnosis'],
            'total_cases' => $total_cases,
            'active_cases' => $active_cases,
            'recent_cases' => $recent_cases,
            'risk_level' => $risk_level
        ];
    }

    echo json_encode([
        'success' => true, 
        'diseases' => $diseases,
        'total_diseases' => count($diseases)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>

