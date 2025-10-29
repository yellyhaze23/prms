<?php
/**
 * ARIMA Forecast Setup Diagnostic Script
 * Run this to check if your environment is ready for ARIMA forecasting
 */

require 'config.php';

header('Content-Type: text/html; charset=utf-8');

$checks = [];
$all_passed = true;

echo "<!DOCTYPE html>
<html>
<head>
    <title>ARIMA Forecast Diagnostics</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .check { padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 5px solid #ccc; }
        .pass { background: #e8f5e9; border-left-color: #4CAF50; }
        .fail { background: #ffebee; border-left-color: #f44336; }
        .warn { background: #fff3e0; border-left-color: #ff9800; }
        .status { font-weight: bold; padding: 3px 10px; border-radius: 3px; color: white; }
        .status.pass { background: #4CAF50; }
        .status.fail { background: #f44336; }
        .status.warn { background: #ff9800; }
        .message { margin: 10px 0; }
        .fix { background: #333; color: #fff; padding: 10px; border-radius: 3px; margin-top: 5px; font-family: monospace; font-size: 12px; }
        .summary { padding: 20px; margin: 20px 0; background: #e3f2fd; border-radius: 5px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
<div class='container'>
    <h1>🔍 ARIMA Forecast Setup Diagnostics</h1>
    <p>Checking if your environment is ready for ARIMA forecasting...</p>";

// Check 1: Database Connection
try {
    if ($conn->ping()) {
        $checks['db_connection'] = [
            'status' => 'PASS',
            'message' => 'Database connection is working'
        ];
    } else {
        throw new Exception('Database connection failed');
    }
} catch (Exception $e) {
    $checks['db_connection'] = [
        'status' => 'FAIL',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ];
    $all_passed = false;
}

// Check 2: disease_summary table exists
try {
    $result = $conn->query("SHOW TABLES LIKE 'disease_summary'");
    if ($result->num_rows > 0) {
        $checks['table_exists'] = [
            'status' => 'PASS',
            'message' => 'disease_summary table exists'
        ];
    } else {
        throw new Exception('Table does not exist');
    }
} catch (Exception $e) {
    $checks['table_exists'] = [
        'status' => 'FAIL',
        'message' => 'disease_summary table does not exist',
        'fix' => 'Create the table using your database schema'
    ];
    $all_passed = false;
}

// Check 3: disease_summary has data
try {
    $result = $conn->query("SELECT COUNT(*) as count FROM disease_summary");
    $row = $result->fetch_assoc();
    $count = $row['count'];
    
    if ($count > 0) {
        $checks['has_data'] = [
            'status' => 'PASS',
            'message' => "disease_summary table has {$count} records"
        ];
        
        // Show sample data
        $sample = $conn->query("SELECT disease_name, year, month, total_cases FROM disease_summary ORDER BY created_at DESC LIMIT 5");
        $sample_data = [];
        while ($r = $sample->fetch_assoc()) {
            $sample_data[] = $r;
        }
        $checks['has_data']['sample'] = $sample_data;
    } else {
        $checks['has_data'] = [
            'status' => 'FAIL',
            'message' => 'disease_summary table is empty - no data to forecast',
            'fix' => 'Run: php ' . __DIR__ . '/populate_disease_summary.php'
        ];
        $all_passed = false;
    }
} catch (Exception $e) {
    $checks['has_data'] = [
        'status' => 'FAIL',
        'message' => 'Could not query disease_summary: ' . $e->getMessage()
    ];
    $all_passed = false;
}

// Check 4: Python installation
$python_cmd = shell_exec('which python3 2>/dev/null');
if ($python_cmd) {
    $python_version = shell_exec('python3 --version 2>&1');
    $checks['python'] = [
        'status' => 'PASS',
        'message' => 'Python is installed: ' . trim($python_version),
        'path' => trim($python_cmd)
    ];
} else {
    $python_cmd = shell_exec('which python 2>/dev/null');
    if ($python_cmd) {
        $python_version = shell_exec('python --version 2>&1');
        $checks['python'] = [
            'status' => 'WARN',
            'message' => 'Python found (as "python"): ' . trim($python_version),
            'note' => 'Prefer python3 on VPS systems',
            'path' => trim($python_cmd)
        ];
    } else {
        $checks['python'] = [
            'status' => 'FAIL',
            'message' => 'Python is not installed or not in PATH',
            'fix' => 'Install Python 3: sudo apt-get install python3'
        ];
        $all_passed = false;
    }
}

// Check 5: Python packages
$required_packages = ['pandas', 'numpy', 'statsmodels', 'matplotlib', 'scikit-learn'];
$python_check_cmd = shell_exec('which python3') ? 'python3' : 'python';
$packages_output = shell_exec("$python_check_cmd -m pip list 2>&1");

$missing_packages = [];
foreach ($required_packages as $package) {
    if (stripos($packages_output, $package) === false) {
        $missing_packages[] = $package;
    }
}

if (empty($missing_packages)) {
    $checks['packages'] = [
        'status' => 'PASS',
        'message' => 'All required Python packages are installed'
    ];
} else {
    $checks['packages'] = [
        'status' => 'FAIL',
        'message' => 'Missing Python packages: ' . implode(', ', $missing_packages),
        'fix' => 'cd ' . dirname(__DIR__) . '/forecasting && pip3 install -r requirements.txt'
    ];
    $all_passed = false;
}

// Check 6: Forecasting directory and scripts
$forecasting_dir = dirname(__DIR__) . '/forecasting';
$forecast_script = $forecasting_dir . '/forecast_arima.py';
$forecast_script_barangay = $forecasting_dir . '/forecast_arima_by_barangay.py';

if (is_dir($forecasting_dir)) {
    if (file_exists($forecast_script) && file_exists($forecast_script_barangay)) {
        $checks['scripts'] = [
            'status' => 'PASS',
            'message' => 'Forecast Python scripts found',
            'files' => [
                'forecast_arima.py' => file_exists($forecast_script),
                'forecast_arima_by_barangay.py' => file_exists($forecast_script_barangay)
            ]
        ];
    } else {
        $checks['scripts'] = [
            'status' => 'FAIL',
            'message' => 'Forecast Python scripts not found',
            'fix' => 'Ensure forecast_arima.py and forecast_arima_by_barangay.py exist in ' . $forecasting_dir
        ];
        $all_passed = false;
    }
} else {
    $checks['scripts'] = [
        'status' => 'FAIL',
        'message' => 'Forecasting directory not found',
        'fix' => 'Create directory: mkdir -p ' . $forecasting_dir
    ];
    $all_passed = false;
}

// Check 7: Cache directory
$cache_dir = $forecasting_dir . '/cache';
if (is_dir($cache_dir) && is_writable($cache_dir)) {
    $checks['cache'] = [
        'status' => 'PASS',
        'message' => 'Cache directory exists and is writable'
    ];
} else {
    if (!is_dir($cache_dir)) {
        @mkdir($cache_dir, 0755, true);
    }
    if (is_dir($cache_dir) && is_writable($cache_dir)) {
        $checks['cache'] = [
            'status' => 'PASS',
            'message' => 'Cache directory created and is writable'
        ];
    } else {
        $checks['cache'] = [
            'status' => 'WARN',
            'message' => 'Cache directory issue',
            'fix' => 'mkdir -p ' . $cache_dir . ' && chmod 755 ' . $cache_dir
        ];
    }
}

// Check 8: Logs directory
$logs_dir = __DIR__ . '/logs';
if (is_dir($logs_dir) && is_writable($logs_dir)) {
    $checks['logs'] = [
        'status' => 'PASS',
        'message' => 'Logs directory exists and is writable'
    ];
} else {
    if (!is_dir($logs_dir)) {
        @mkdir($logs_dir, 0755, true);
    }
    if (is_dir($logs_dir) && is_writable($logs_dir)) {
        $checks['logs'] = [
            'status' => 'PASS',
            'message' => 'Logs directory created and is writable'
        ];
    } else {
        $checks['logs'] = [
            'status' => 'WARN',
            'message' => 'Logs directory issue',
            'fix' => 'mkdir -p ' . $logs_dir . ' && chmod 755 ' . $logs_dir
        ];
    }
}

// Display results
foreach ($checks as $name => $check) {
    $status_class = strtolower($check['status']);
    echo "<div class='check {$status_class}'>";
    echo "<span class='status {$status_class}'>{$check['status']}</span> ";
    echo "<strong>" . ucfirst(str_replace('_', ' ', $name)) . "</strong>";
    echo "<div class='message'>{$check['message']}</div>";
    
    if (isset($check['note'])) {
        echo "<div class='message'><em>Note: {$check['note']}</em></div>";
    }
    
    if (isset($check['path'])) {
        echo "<div class='message'><code>{$check['path']}</code></div>";
    }
    
    if (isset($check['sample'])) {
        echo "<div class='message'><strong>Sample data:</strong><pre>";
        foreach ($check['sample'] as $row) {
            echo "{$row['disease_name']}: {$row['year']}-{$row['month']} = {$row['total_cases']} cases\n";
        }
        echo "</pre></div>";
    }
    
    if (isset($check['files'])) {
        echo "<div class='message'><strong>Files:</strong><br>";
        foreach ($check['files'] as $file => $exists) {
            echo "  " . ($exists ? '✅' : '❌') . " $file<br>";
        }
        echo "</div>";
    }
    
    if (isset($check['fix'])) {
        echo "<div class='fix'>Fix: {$check['fix']}</div>";
    }
    
    echo "</div>";
}

// Summary
echo "<div class='summary'>";
if ($all_passed) {
    echo "<h2 style='color: #4CAF50;'>✅ All Checks Passed!</h2>";
    echo "<p>Your environment is ready for ARIMA forecasting. You can now use the forecast feature.</p>";
} else {
    echo "<h2 style='color: #f44336;'>❌ Some Checks Failed</h2>";
    echo "<p>Please fix the issues above before using ARIMA forecasting.</p>";
}
echo "</div>";

echo "</div></body></html>";

$conn->close();
?>

