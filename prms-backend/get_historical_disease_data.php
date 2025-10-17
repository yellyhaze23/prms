<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$disease = $_GET['disease'] ?? null;
$months = (int)($_GET['months'] ?? 12); // Default to 12 months of historical data

try {
    // Build the query to get historical data
    $sql = "
        SELECT 
            mr.diagnosis as disease_name,
            DATE_FORMAT(mr.created_at, '%Y-%m') as month,
            COUNT(*) as cases
        FROM medical_records mr
        WHERE mr.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        AND mr.diagnosis IS NOT NULL
    ";
    
    $params = [$months];
    
    // Add disease filter if specified
    if ($disease && $disease !== 'All Diseases') {
        $sql .= " AND mr.diagnosis = ?";
        $params[] = $disease;
    }
    
    $sql .= "
        GROUP BY mr.diagnosis, DATE_FORMAT(mr.created_at, '%Y-%m')
        ORDER BY mr.diagnosis, month ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(str_repeat('s', count($params)), ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $historicalData = [];
    while ($row = $result->fetch_assoc()) {
        $historicalData[] = [
            'disease_name' => $row['disease_name'],
            'month' => $row['month'],
            'cases' => (int)$row['cases'],
            'type' => 'historical'
        ];
    }
    
    // Group by disease for easier processing
    $groupedData = [];
    foreach ($historicalData as $data) {
        if (!isset($groupedData[$data['disease_name']])) {
            $groupedData[$data['disease_name']] = [];
        }
        $groupedData[$data['disease_name']][] = $data;
    }
    
    echo json_encode([
        'success' => true,
        'historical_data' => $groupedData,
        'total_months' => $months,
        'diseases' => array_keys($groupedData)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching historical data: ' . $e->getMessage()
    ]);
}
?>
