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

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

$disease = isset($input['disease']) ? $input['disease'] : null;
$forecast_period = isset($input['forecast_period']) ? (int)$input['forecast_period'] : 3;

try {
    // Get disease data from disease_summary table
    $sql = "SELECT disease_name, year, month, total_cases 
            FROM disease_summary 
            ORDER BY disease_name, year, month";
    
    if ($disease) {
        $sql = "SELECT disease_name, year, month, total_cases 
                FROM disease_summary 
                WHERE disease_name = ? 
                ORDER BY year, month";
    }
    
    $stmt = $conn->prepare($sql);
    if ($disease) {
        $stmt->bind_param("s", $disease);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $disease_data = [];
    while ($row = $result->fetch_assoc()) {
        $disease_data[] = $row;
    }
    
    if (empty($disease_data)) {
        throw new Exception('No disease data found in disease_summary table');
    }
    
    // Create JSON file for Python script
    $json_file = __DIR__ . '/../forecasting/temp_forecast_data.json';
    file_put_contents($json_file, json_encode($disease_data));
    
    // Path to the forecasting directory
    $forecasting_dir = __DIR__ . '/../forecasting';
    $python_script = $forecasting_dir . '/forecast_arima.py';
    
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
    $area_json = json_encode(['total_diseases' => $forecast_data['summary']['total_diseases']]);
    $current_json = json_encode(['generated_at' => $forecast_data['summary']['generated_at']]);
    
    $disease_name = $disease ?: 'All Diseases';
    $population = 1000;
    
    $stmt->bind_param("siissss", 
        $disease_name, 
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
            'summary' => $forecast_data['summary']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
