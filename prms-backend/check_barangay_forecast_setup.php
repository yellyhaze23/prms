<?php
/**
 * Diagnostic script to check Barangay Forecast setup
 * Run this to identify any setup issues
 */

require 'config.php';
header("Content-Type: application/json");

$checks = [];
$all_passed = true;

// Check 1: Database table exists
try {
    $result = $conn->query("SHOW TABLES LIKE 'disease_summary_by_barangay'");
    $table_exists = $result->num_rows > 0;
    $checks['table_exists'] = [
        'status' => $table_exists ? 'PASS' : 'FAIL',
        'message' => $table_exists ? 'Table disease_summary_by_barangay exists' : 'Table disease_summary_by_barangay does NOT exist',
        'fix' => $table_exists ? null : 'Run: mysql -u root -p prms_db < prms-backend/create_disease_summary_by_barangay.sql'
    ];
    if (!$table_exists) $all_passed = false;
} catch (Exception $e) {
    $checks['table_exists'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
    $all_passed = false;
}

// Check 2: Table has data
try {
    $result = $conn->query("SELECT COUNT(*) as count FROM disease_summary_by_barangay");
    $row = $result->fetch_assoc();
    $has_data = $row['count'] > 0;
    $checks['table_has_data'] = [
        'status' => $has_data ? 'PASS' : 'FAIL',
        'message' => $has_data ? "Table has {$row['count']} records" : 'Table is EMPTY',
        'fix' => $has_data ? null : 'Visit: http://localhost/prms/prms-backend/populate_disease_summary_by_barangay.php'
    ];
    if (!$has_data) $all_passed = false;
} catch (Exception $e) {
    $checks['table_has_data'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
    $all_passed = false;
}

// Check 3: Patients have barangay_id
try {
    $result = $conn->query("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN barangay_id IS NOT NULL THEN 1 ELSE 0 END) as with_barangay
        FROM patients");
    $row = $result->fetch_assoc();
    $has_barangay = $row['with_barangay'] > 0;
    $checks['patients_have_barangay'] = [
        'status' => $has_barangay ? 'PASS' : 'WARN',
        'message' => "{$row['with_barangay']} out of {$row['total']} patients have barangay assigned",
        'fix' => $has_barangay ? null : 'Some patients need barangay_id assigned'
    ];
} catch (Exception $e) {
    $checks['patients_have_barangay'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
}

// Check 4: Python script exists
$python_script = __DIR__ . '/../forecasting/forecast_arima_by_barangay.py';
$script_exists = file_exists($python_script);
$checks['python_script_exists'] = [
    'status' => $script_exists ? 'PASS' : 'FAIL',
    'message' => $script_exists ? 'Python script found at: ' . $python_script : 'Python script NOT found at: ' . $python_script,
    'fix' => $script_exists ? null : 'The forecast_arima_by_barangay.py file is missing'
];
if (!$script_exists) $all_passed = false;

// Check 5: Cache directory exists and is writable
$cache_dir = __DIR__ . '/../forecasting/cache';
$cache_ok = is_dir($cache_dir) && is_writable($cache_dir);
if (!is_dir($cache_dir)) {
    @mkdir($cache_dir, 0755, true);
    $cache_ok = is_dir($cache_dir) && is_writable($cache_dir);
}
$checks['cache_directory'] = [
    'status' => $cache_ok ? 'PASS' : 'WARN',
    'message' => $cache_ok ? 'Cache directory exists and is writable' : 'Cache directory issue at: ' . $cache_dir,
    'fix' => $cache_ok ? null : 'Create directory: mkdir -p ' . $cache_dir . ' && chmod 755 ' . $cache_dir
];

// Check 6: Logs directory exists
$logs_dir = __DIR__ . '/logs';
$logs_ok = is_dir($logs_dir) && is_writable($logs_dir);
if (!is_dir($logs_dir)) {
    @mkdir($logs_dir, 0755, true);
    $logs_ok = is_dir($logs_dir) && is_writable($logs_dir);
}
$checks['logs_directory'] = [
    'status' => $logs_ok ? 'PASS' : 'WARN',
    'message' => $logs_ok ? 'Logs directory exists and is writable' : 'Logs directory issue at: ' . $logs_dir,
    'fix' => $logs_ok ? null : 'Create directory: mkdir -p ' . $logs_dir . ' && chmod 755 ' . $logs_dir
];

// Check 7: Test Python execution
$test_output = shell_exec('python --version 2>&1');
$python_ok = !empty($test_output);
$checks['python_executable'] = [
    'status' => $python_ok ? 'PASS' : 'FAIL',
    'message' => $python_ok ? 'Python is available: ' . trim($test_output) : 'Python is NOT available',
    'fix' => $python_ok ? null : 'Install Python or ensure it\'s in the system PATH'
];
if (!$python_ok) $all_passed = false;

// Check 8: Sample data query
try {
    $result = $conn->query("SELECT 
        dsb.disease_name,
        b.name as barangay_name,
        COUNT(*) as months
        FROM disease_summary_by_barangay dsb
        INNER JOIN barangays b ON dsb.barangay_id = b.id
        GROUP BY dsb.disease_name, b.name
        LIMIT 5");
    
    $samples = [];
    while ($row = $result->fetch_assoc()) {
        $samples[] = $row;
    }
    
    $checks['sample_data'] = [
        'status' => count($samples) > 0 ? 'PASS' : 'WARN',
        'message' => count($samples) > 0 ? 'Found ' . count($samples) . ' disease-barangay combinations' : 'No data combinations found',
        'data' => $samples
    ];
} catch (Exception $e) {
    $checks['sample_data'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
}

// Summary
$response = [
    'success' => $all_passed,
    'overall_status' => $all_passed ? 'READY' : 'SETUP REQUIRED',
    'checks' => $checks,
    'next_steps' => $all_passed ? ['You can now use the barangay forecast feature!'] : []
];

// Add next steps for failed checks
if (!$all_passed) {
    foreach ($checks as $check) {
        if (isset($check['fix']) && $check['fix']) {
            $response['next_steps'][] = $check['fix'];
        }
    }
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>

