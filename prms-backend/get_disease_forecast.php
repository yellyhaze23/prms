<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['disease'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Disease parameter is required']);
    exit;
}

$disease = $input['disease'];
$forecast_period = isset($input['forecast_period']) ? (int)$input['forecast_period'] : 30;

try {
    // Check if recent forecast already exists (within last 7 days)
    $check_sql = "SELECT * FROM forecasts 
                  WHERE disease = ? 
                  AND generated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                  ORDER BY generated_at DESC 
                  LIMIT 1";
    
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $disease);
    $check_stmt->execute();
    $existing_forecast = $check_stmt->get_result()->fetch_assoc();
    
    if ($existing_forecast) {
        // Return existing forecast
        echo json_encode([
            'success' => true,
            'data' => [
                'forecast_results' => json_decode($existing_forecast['forecast_results'], true),
                'indicators' => json_decode($existing_forecast['indicators'], true),
                'generated_at' => $existing_forecast['generated_at'],
                'from_cache' => true
            ]
        ]);
        exit;
    }

    // Get disease data from disease_summary table for specific disease
    $sql = "SELECT disease_name, year, month, total_cases 
            FROM disease_summary 
            WHERE disease_name = ? 
            ORDER BY year, month";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $disease);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $disease_data = [];
    while ($row = $result->fetch_assoc()) {
        $disease_data[] = $row;
    }
    
    if (empty($disease_data)) {
        throw new Exception("No historical data found for disease: $disease");
    }
    
    // Create JSON file for Python script
    $json_file = __DIR__ . '/../forecasting/temp_forecast_data.json';
    file_put_contents($json_file, json_encode($disease_data));
    
    // Path to the forecasting directory
    $forecasting_dir = __DIR__ . '/../forecasting';
    
    // Change to forecasting directory and run Python script
    $original_dir = getcwd();
    chdir($forecasting_dir);
    
    // Run the Python script with JSON data
    $command = "python forecast_arima.py \"$json_file\" $forecast_period 2>&1";
    $output = shell_exec($command);
    
    // Change back to original directory
    chdir($original_dir);
    
    // Parse the JSON output from Python script
    $forecast_data = json_decode($output, true);
    
    if (!$forecast_data || !isset($forecast_data['success'])) {
        throw new Exception('Failed to parse forecast results: ' . $output);
    }
    
    // Save forecast to database
    $save_sql = "INSERT INTO forecasts (
        disease, 
        forecast_period, 
        population, 
        forecast_results, 
        indicators, 
        area_data, 
        current_data, 
        generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($save_sql);
    $forecast_json = json_encode($forecast_data['forecast_results']);
    $indicators_json = json_encode($forecast_data['summary']);
    $area_json = json_encode(['total_diseases' => 1]);
    $current_json = json_encode(['generated_at' => date('Y-m-d H:i:s')]);
    
    $population = 1000; // Default population
    
    $stmt->bind_param("siissss", 
        $disease, 
        $forecast_period, 
        $population,
        $forecast_json, 
        $indicators_json, 
        $area_json, 
        $current_json
    );
    $stmt->execute();
    
    // Clean up temp file
    if (file_exists($json_file)) {
        unlink($json_file);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'forecast_results' => $forecast_data['forecast_results'],
            'summary' => $forecast_data['summary'],
            'generated_at' => date('Y-m-d H:i:s'),
            'from_cache' => false
        ]
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
