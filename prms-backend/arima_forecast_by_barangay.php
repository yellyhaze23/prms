<?php
/**
 * ARIMA Forecasting with Barangay-Level Breakdown
 * This endpoint generates disease forecasts per barangay
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display to browser
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/barangay_forecast_errors.log');

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
$barangay_id = isset($input['barangay_id']) ? (int)$input['barangay_id'] : null;
$forecast_period = isset($input['forecast_period']) ? (int)$input['forecast_period'] : 3;

// Create cache directory if it doesn't exist
$cache_dir = __DIR__ . '/../forecasting/cache';
if (!is_dir($cache_dir)) {
    mkdir($cache_dir, 0755, true);
}

// Generate cache key based on disease, barangay, and forecast period
$cache_key = md5(($disease ?: 'all') . '_' . ($barangay_id ?: 'all') . '_barangay_' . $forecast_period . '_' . date('Y-m-d-H'));
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
    error_log("Barangay forecast request - Disease: " . ($disease ?: 'all') . ", Period: " . $forecast_period);
    
    // First check if disease_summary_by_barangay table exists
    $check_table = "SHOW TABLES LIKE 'disease_summary_by_barangay'";
    $result = $conn->query($check_table);
    
    if ($result->num_rows == 0) {
        error_log("ERROR: Table disease_summary_by_barangay does not exist");
        throw new Exception('Table disease_summary_by_barangay does not exist. Please create it first by running: mysql -u root -p prms_db < prms-backend/create_disease_summary_by_barangay.sql');
    }
    
    error_log("Table exists, checking for data...");
    
    // Check if table has data
    $check_data = "SELECT COUNT(*) as count FROM disease_summary_by_barangay";
    $count_result = $conn->query($check_data);
    $count_row = $count_result->fetch_assoc();
    
    error_log("Found " . $count_row['count'] . " records in disease_summary_by_barangay");
    
    if ($count_row['count'] == 0) {
        throw new Exception('No data found in disease_summary_by_barangay table. Please populate it first by visiting: http://localhost/prms/prms-backend/populate_disease_summary_by_barangay.php');
    }
    
    // Get disease data BY BARANGAY from disease_summary_by_barangay with last 12 months
    $sql = "SELECT 
                dsb.disease_name, 
                b.name as barangay_name,
                dsb.year, 
                dsb.month, 
                dsb.total_cases,
                b.latitude,
                b.longitude
            FROM disease_summary_by_barangay dsb
            INNER JOIN barangays b ON dsb.barangay_id = b.id
            WHERE (dsb.year * 12 + dsb.month) >= (YEAR(CURDATE()) * 12 + MONTH(CURDATE()) - 12)";
    
    $params = [];
    $types = '';
    
    if ($disease) {
        $sql .= " AND dsb.disease_name = ?";
        $params[] = $disease;
        $types .= 's';
    }
    
    if ($barangay_id) {
        $sql .= " AND dsb.barangay_id = ?";
        $params[] = $barangay_id;
        $types .= 'i';
    }
    
    $sql .= " ORDER BY dsb.disease_name, b.name, dsb.year, dsb.month";
    
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $disease_data = [];
    while ($row = $result->fetch_assoc()) {
        $disease_data[] = $row;
    }
    
    if (empty($disease_data)) {
        error_log("ERROR: No disease data found after query. Filters - Disease: " . ($disease ?: 'all') . ", Barangay: " . ($barangay_id ?: 'all'));
        throw new Exception('No disease data found for barangay-level forecasting. Please check your filters or populate the database.');
    }
    
    error_log("Found " . count($disease_data) . " records for forecasting");
    
    // Create JSON file for Python script
    $json_file = __DIR__ . '/../forecasting/temp_forecast_barangay_data.json';
    if (!file_put_contents($json_file, json_encode($disease_data))) {
        error_log("ERROR: Failed to write JSON file: " . $json_file);
        throw new Exception('Failed to create temporary data file');
    }
    
    error_log("Created JSON file: " . $json_file);
    
    // Path to the forecasting directory
    $forecasting_dir = __DIR__ . '/../forecasting';
    $python_script = $forecasting_dir . '/forecast_arima_by_barangay.py';
    
    // Check if Python script exists
    if (!file_exists($python_script)) {
        error_log("ERROR: Python script not found: " . $python_script);
        throw new Exception('Python forecasting script not found at: ' . $python_script);
    }
    
    error_log("Python script found: " . $python_script);
    
    // Change to forecasting directory and run Python script
    $original_dir = getcwd();
    chdir($forecasting_dir);
    
    // Run the Python script with JSON data
    $command = "python forecast_arima_by_barangay.py \"$json_file\" $forecast_period 2>&1";
    error_log("Executing command: " . $command);
    
    $output = shell_exec($command);
    
    // Change back to original directory
    chdir($original_dir);
    
    error_log("Python output: " . substr($output, 0, 500)); // Log first 500 chars
    
    // Parse the JSON output from Python script
    $forecast_data = json_decode($output, true);
    
    if (!$forecast_data || !isset($forecast_data['success'])) {
        error_log("ERROR: Failed to parse Python output. Raw output: " . $output);
        throw new Exception('Failed to parse forecast results. Python output: ' . substr($output, 0, 200));
    }
    
    if (!$forecast_data['success']) {
        $error_msg = $forecast_data['error'] ?? 'Unknown error';
        error_log("ERROR: Python script failed: " . $error_msg);
        throw new Exception('Forecasting failed: ' . $error_msg);
    }
    
    error_log("Forecast successful! Generated " . count($forecast_data['forecast_results'] ?? []) . " forecast results");
    
    // Clean up temp file
    if (file_exists($json_file)) {
        unlink($json_file);
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
        error_log("Failed to prepare INSERT statement: " . $conn->error);
        error_log("SQL: " . $save_sql);
    } else {
        $disease_name = $disease ?: 'All Diseases';
        $forecast_type = 'barangay';
        $population = $forecast_data['summary']['unique_barangays'] ?? 0;
        
        $forecast_json = json_encode($forecast_data['forecast_results']);
        $indicators_json = json_encode($forecast_data['summary']);
        $area_json = json_encode([
            'high_risk_barangays' => $forecast_data['high_risk_barangays'],
            'barangay_summary' => $forecast_data['barangay_summary']
        ]);
        $current_json = json_encode(['generated_at' => $forecast_data['summary']['generated_at']]);
        
        error_log("Attempting to save barangay forecast - Disease: $disease_name, Type: $forecast_type, Period: $forecast_period, Population: $population");
        
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
            error_log("Failed to bind parameters: " . $stmt->error);
        } else {
            if (!$stmt->execute()) {
                error_log("Failed to execute INSERT: " . $stmt->error);
            } else {
                $insert_id = $conn->insert_id;
                error_log("✓ Barangay forecast saved to database successfully! Insert ID: $insert_id");
            }
        }
        $stmt->close();
    }
    
    // Prepare response data
    $response_data = [
        'success' => true,
        'data' => [
            'forecast_results' => $forecast_data['forecast_results'],
            'high_risk_barangays' => $forecast_data['high_risk_barangays'],
            'barangay_summary' => $forecast_data['barangay_summary'],
            'summary' => $forecast_data['summary']
        ]
    ];
    
    // Cache the results for future requests
    file_put_contents($cache_file, json_encode($response_data));
    
    echo json_encode($response_data);
    
} catch (Exception $e) {
    $error_message = $e->getMessage();
    $error_trace = $e->getTraceAsString();
    
    error_log("EXCEPTION in barangay forecast: " . $error_message);
    error_log("Stack trace: " . $error_trace);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $error_message,
        'debug_info' => [
            'table_exists' => isset($result) && $result->num_rows > 0,
            'data_count' => isset($count_row) ? $count_row['count'] : 0,
            'python_script' => isset($python_script) ? file_exists($python_script) : false,
            'json_file' => isset($json_file) ? file_exists($json_file) : false
        ]
    ]);
}

$conn->close();
?>

