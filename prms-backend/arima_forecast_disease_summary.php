<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display to browser
ini_set('log_errors', 1);

// Create logs directory if it doesn't exist
$logs_dir = __DIR__ . '/logs';
if (!is_dir($logs_dir)) {
    mkdir($logs_dir, 0755, true);
}
ini_set('error_log', $logs_dir . '/overall_forecast_errors.log');

require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw_input = file_get_contents('php://input');
$input = json_decode($raw_input, true);

if (!$input) {
    error_log("Overall forecast - JSON decode failed. Raw input: " . substr($raw_input, 0, 200));
    error_log("JSON error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => 'Invalid JSON input'
    ]);
    exit;
}

$disease = isset($input['disease']) ? $input['disease'] : null;
$forecast_period = isset($input['forecast_period']) ? (int)$input['forecast_period'] : 3;

error_log("Overall forecast request - Disease: " . ($disease ?: 'all') . ", Period: " . $forecast_period);

// Create cache directory if it doesn't exist
$cache_dir = __DIR__ . '/../forecasting/cache';
if (!is_dir($cache_dir)) {
    mkdir($cache_dir, 0755, true);
}

// Generate cache key based on disease and forecast period
$cache_key = md5($disease . '_' . $forecast_period . '_' . date('Y-m'));
$cache_file = $cache_dir . '/' . $cache_key . '.json';

// Check if cached result exists and is less than 1 hour old
if (file_exists($cache_file) && (time() - filemtime($cache_file)) < 3600) {
    $cached_data = json_decode(file_get_contents($cache_file), true);
    if ($cached_data && isset($cached_data['success']) && $cached_data['success']) {
        echo json_encode([
            'success' => true,
            'data' => $cached_data['data'],
            'cached' => true,
            'cache_age' => time() - filemtime($cache_file)
        ]);
        exit;
    }
}

try {
    // Get disease data from disease_summary table with data limiting for performance
    // For large datasets, limit to last 6 months of data for faster training
    $sql = "SELECT disease_name, year, month, total_cases 
            FROM disease_summary 
            WHERE (year * 12 + month) >= (YEAR(CURDATE()) * 12 + MONTH(CURDATE()) - 6)
            ORDER BY disease_name, year, month";
    
    if ($disease) {
        $sql = "SELECT disease_name, year, month, total_cases 
                FROM disease_summary 
                WHERE disease_name = ? 
                AND (year * 12 + month) >= (YEAR(CURDATE()) * 12 + MONTH(CURDATE()) - 6)
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
    
    // Set matplotlib config directory to avoid permission errors
    putenv('MPLCONFIGDIR=/tmp/matplotlib_cache');
    
    // Run the Python script with JSON data
    // Try python3 first (common on Linux/VPS), fallback to python
    $python_cmd = shell_exec('which python3') ? 'python3' : 'python';
    $command = "MPLCONFIGDIR=/tmp/matplotlib_cache $python_cmd forecast_arima.py \"$json_file\" $forecast_period 2>&1";
    error_log("Executing Python command: " . $command);
    $output = shell_exec($command);
    
    // Change back to original directory
    chdir($original_dir);
    
    error_log("Python script output (first 500 chars): " . substr($output, 0, 500));
    
    // Parse the JSON output from Python script
    $forecast_data = json_decode($output, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        error_log("Full Python output: " . $output);
    }
    
    if (!$forecast_data || !isset($forecast_data['success'])) {
        throw new Exception('Failed to parse forecast results: ' . $output);
    }
    
    // Check if the forecast was successful
    if (!$forecast_data['success']) {
        $error_msg = isset($forecast_data['error']) ? $forecast_data['error'] : 'Unknown error from Python script';
        throw new Exception('Forecast generation failed: ' . $error_msg);
    }
    
    // Validate that required data exists
    if (!isset($forecast_data['forecast_results']) || !isset($forecast_data['summary'])) {
        throw new Exception('Invalid forecast data structure returned from Python script');
    }
    
    // Save forecast to database
    $save_sql = "INSERT INTO forecasts (
        disease, 
        forecast_type,
        forecast_period, 
        population, 
        forecast_results, 
        indicators, 
        area_data, 
        current_data, 
        generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($save_sql);
    
    if (!$stmt) {
        error_log("Failed to prepare INSERT statement for overall forecast: " . $conn->error);
        error_log("SQL: " . $save_sql);
    } else {
        $forecast_json = json_encode($forecast_data['forecast_results']);
        $indicators_json = json_encode($forecast_data['summary']);
        $area_json = json_encode(['total_diseases' => $forecast_data['summary']['total_diseases']]);
        $current_json = json_encode(['generated_at' => $forecast_data['summary']['generated_at']]);
        
        $disease_name = $disease ?: 'All Diseases';
        $forecast_type = 'overall';
        $population = 1000;
        
        error_log("Attempting to save overall forecast - Disease: $disease_name, Type: $forecast_type, Period: $forecast_period");
        
        if (!$stmt->bind_param("ssiissss", 
            $disease_name,
            $forecast_type,
            $forecast_period, 
            $population,
            $forecast_json, 
            $indicators_json, 
            $area_json, 
            $current_json
        )) {
            error_log("Failed to bind parameters for overall forecast: " . $stmt->error);
        } else {
            if (!$stmt->execute()) {
                error_log("Failed to execute INSERT for overall forecast: " . $stmt->error);
            } else {
                $insert_id = $conn->insert_id;
                error_log("✓ Overall forecast saved to database successfully! Insert ID: $insert_id");
            }
        }
        $stmt->close();
    }
    
    // Clean up temp file
    if (file_exists($json_file)) {
        unlink($json_file);
    }
    
    // Prepare response data
    $response_data = [
        'success' => true,
        'data' => [
            'forecast_results' => $forecast_data['forecast_results'],
            'summary' => $forecast_data['summary']
        ]
    ];
    
    // Cache the results for future requests
    file_put_contents($cache_file, json_encode($response_data));
    
    echo json_encode($response_data);
    
} catch (Exception $e) {
    error_log("Overall forecast error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
