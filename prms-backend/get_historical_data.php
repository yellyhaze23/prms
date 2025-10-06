<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // Get historical data from disease_summary table
    $sql = "SELECT disease_name, year, month, total_cases 
            FROM disease_summary 
            ORDER BY disease_name, year, month";
    
    $result = $conn->query($sql);
    
    $historical_data = [];
    while ($row = $result->fetch_assoc()) {
        $historical_data[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $historical_data
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch historical data: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
