<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$period = $_GET['period'] ?? '30'; // Default to 30 days
$days = (int)$period;

try {
    // Get trends data for each disease
    $sql = "
        SELECT 
            mr.diagnosis as disease,
            DATE(mr.created_at) as date,
            COUNT(*) as cases
        FROM medical_records mr
        WHERE mr.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND mr.diagnosis IS NOT NULL
        GROUP BY mr.diagnosis, DATE(mr.created_at)
        ORDER BY date ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $days);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $trends = [];
    $diseases = [];
    $allDates = [];
    
    // Generate all dates in the period
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $allDates[] = $date;
    }
    
    while ($row = $result->fetch_assoc()) {
        $disease = $row['disease'];
        $date = $row['date'];
        $cases = (int)$row['cases'];
        
        if (!in_array($disease, $diseases)) {
            $diseases[] = $disease;
        }
        
        if (!isset($trends[$disease])) {
            $trends[$disease] = [
                'dates' => $allDates,
                'cases' => array_fill(0, count($allDates), 0)
            ];
        }
        
        $dateIndex = array_search($date, $allDates);
        if ($dateIndex !== false) {
            $trends[$disease]['cases'][$dateIndex] = $cases;
        }
    }
    
    echo json_encode([
        'success' => true,
        'trends' => $trends,
        'diseases' => $diseases,
        'period_days' => $days
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching trends data: ' . $e->getMessage()
    ]);
}
?>
