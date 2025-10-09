<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // Get top 5 diseases with their statistics
    $sql = "
        SELECT 
            mr.diagnosis,
            COUNT(*) as total_cases,
            COUNT(CASE WHEN mr.date_of_consultation >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_cases
        FROM medical_records mr
        WHERE mr.diagnosis IS NOT NULL AND mr.diagnosis != ''
        GROUP BY mr.diagnosis
        ORDER BY total_cases DESC
        LIMIT 5
    ";

    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . $conn->error);
    }

    $diseases = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate risk level based on active cases
        $risk_level = 'Low';
        $active_cases = (int)$row['active_cases'];
        $total_cases = (int)$row['total_cases'];
        
        // Simple risk assessment based on active cases
        if ($active_cases >= 10) {
            $risk_level = 'High';
        } elseif ($active_cases >= 5) {
            $risk_level = 'Medium';
        } else {
            $risk_level = 'Low';
        }

        $diseases[] = [
            'disease' => $row['diagnosis'],
            'total_cases' => $total_cases,
            'active_cases' => $active_cases,
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
