<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

try {
    // Get recent forecasts from database
    $sql = "SELECT id, disease, forecast_period, population, forecast_results, 
                   indicators, area_data, current_data, generated_at
            FROM forecasts 
            ORDER BY generated_at DESC 
            LIMIT 10";
    
    $result = $conn->query($sql);
    $forecasts = [];
    
    while ($row = $result->fetch_assoc()) {
        $forecasts[] = [
            'id' => $row['id'],
            'disease' => $row['disease'],
            'forecast_period' => $row['forecast_period'],
            'population' => $row['population'],
            'forecast_results' => json_decode($row['forecast_results'], true),
            'indicators' => json_decode($row['indicators'], true),
            'area_data' => json_decode($row['area_data'], true),
            'current_data' => json_decode($row['current_data'], true),
            'generated_at' => $row['generated_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'forecasts' => $forecasts,
        'count' => count($forecasts)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
