<?php
/**
 * Forecast Logs Viewer
 * View Python and PHP forecast logs in real-time
 */

// Simple authentication - change this password!
$ADMIN_PASSWORD = 'admin123';

$password = $_GET['password'] ?? '';
if ($password !== $ADMIN_PASSWORD) {
    die('Access denied. Use: ?password=admin123');
}

header('Content-Type: text/html; charset=utf-8');

$logs_dir = __DIR__ . '/logs';
$cache_dir = dirname(__DIR__) . '/forecasting/cache';

// Get log file contents
function getLogContents($file, $lines = 100) {
    if (!file_exists($file)) {
        return "Log file not found: $file";
    }
    
    $content = file($file);
    $recent = array_slice($content, -$lines);
    return implode('', $recent);
}

// Get cache files info
function getCacheInfo($cache_dir) {
    if (!is_dir($cache_dir)) {
        return ['error' => 'Cache directory not found'];
    }
    
    $files = glob($cache_dir . '/*.json');
    $info = [];
    
    foreach ($files as $file) {
        $age = time() - filemtime($file);
        $size = filesize($file);
        $content = json_decode(file_get_contents($file), true);
        
        $info[] = [
            'filename' => basename($file),
            'age' => $age,
            'age_formatted' => gmdate("H:i:s", $age),
            'size' => $size,
            'has_data' => isset($content['data']),
            'is_valid' => isset($content['success']) && $content['success']
        ];
    }
    
    return $info;
}

$action = $_GET['action'] ?? 'view';

// Handle actions
if ($action === 'clear_cache') {
    $files = glob($cache_dir . '/*.json');
    $deleted = 0;
    foreach ($files as $file) {
        if (unlink($file)) {
            $deleted++;
        }
    }
    $message = "✅ Cleared $deleted cache files";
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Forecast Logs Viewer</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #4ec9b0;
            margin-bottom: 20px;
            font-size: 24px;
            border-bottom: 2px solid #4ec9b0;
            padding-bottom: 10px;
        }
        h2 {
            color: #ce9178;
            margin: 30px 0 10px 0;
            font-size: 18px;
        }
        .log-container {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
            max-height: 500px;
            overflow-y: auto;
            font-size: 12px;
            line-height: 1.6;
        }
        .log-container pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .error { color: #f48771; }
        .success { color: #4ec9b0; }
        .warning { color: #dcdcaa; }
        .info { color: #569cd6; }
        .button {
            display: inline-block;
            background: #0e639c;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin: 5px;
            border: none;
            cursor: pointer;
            font-family: inherit;
        }
        .button:hover {
            background: #1177bb;
        }
        .button.danger {
            background: #c5252a;
        }
        .button.danger:hover {
            background: #e51400;
        }
        .cache-info {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .cache-file {
            padding: 10px;
            margin: 5px 0;
            background: #2d2d30;
            border-left: 3px solid #4ec9b0;
            border-radius: 3px;
        }
        .cache-file.invalid {
            border-left-color: #f48771;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 4px;
            padding: 15px;
            text-align: center;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #4ec9b0;
        }
        .stat-label {
            font-size: 12px;
            color: #858585;
            margin-top: 5px;
        }
        .message {
            background: #1e5128;
            border: 1px solid #4ec9b0;
            color: #4ec9b0;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .actions {
            margin-bottom: 20px;
        }
        .refresh-note {
            color: #858585;
            font-size: 11px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>📊 ARIMA Forecast Logs Viewer</h1>
    
    <?php if (isset($message)): ?>
        <div class="message"><?= $message ?></div>
    <?php endif; ?>
    
    <div class="actions">
        <a href="?password=<?= $ADMIN_PASSWORD ?>" class="button">🔄 Refresh Logs</a>
        <a href="?password=<?= $ADMIN_PASSWORD ?>&action=clear_cache" class="button danger" onclick="return confirm('Clear all forecast cache files?')">🗑️ Clear Cache</a>
        <a href="diagnose_forecast_setup.php" class="button" target="_blank">🔍 Run Diagnostics</a>
    </div>
    
    <div class="stats">
        <?php
        $overall_log = $logs_dir . '/overall_forecast_errors.log';
        $barangay_log = $logs_dir . '/barangay_forecast_errors.log';
        $cache_info = getCacheInfo($cache_dir);
        
        $overall_size = file_exists($overall_log) ? filesize($overall_log) : 0;
        $barangay_size = file_exists($barangay_log) ? filesize($barangay_log) : 0;
        $cache_count = is_array($cache_info) && !isset($cache_info['error']) ? count($cache_info) : 0;
        ?>
        
        <div class="stat-card">
            <div class="stat-value"><?= number_format($overall_size / 1024, 1) ?> KB</div>
            <div class="stat-label">Overall Forecast Log Size</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value"><?= number_format($barangay_size / 1024, 1) ?> KB</div>
            <div class="stat-label">Barangay Forecast Log Size</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value"><?= $cache_count ?></div>
            <div class="stat-label">Cached Forecast Files</div>
        </div>
    </div>
    
    <h2>📁 Cache Files Status</h2>
    <div class="cache-info">
        <?php
        if (isset($cache_info['error'])):
            echo "<div class='error'>{$cache_info['error']}</div>";
        elseif (empty($cache_info)):
            echo "<div class='info'>✅ No cache files (cache is clear)</div>";
        else:
            foreach ($cache_info as $file):
                $class = $file['is_valid'] ? '' : 'invalid';
                $status = $file['is_valid'] ? '✅' : '❌';
        ?>
            <div class="cache-file <?= $class ?>">
                <strong><?= $status ?> <?= htmlspecialchars($file['filename']) ?></strong><br>
                Age: <?= $file['age_formatted'] ?> | Size: <?= $file['size'] ?> bytes | Valid: <?= $file['is_valid'] ? 'Yes' : 'No' ?>
            </div>
        <?php
            endforeach;
        endif;
        ?>
    </div>
    
    <h2>📋 Overall Forecast Errors (Last 100 lines)</h2>
    <div class="log-container">
        <pre><?= htmlspecialchars(getLogContents($overall_log)) ?></pre>
    </div>
    
    <h2>📋 Barangay Forecast Errors (Last 100 lines)</h2>
    <div class="log-container">
        <pre><?= htmlspecialchars(getLogContents($barangay_log)) ?></pre>
    </div>
    
    <div class="refresh-note">
        Auto-refresh not enabled. Click "Refresh Logs" button to update.
    </div>
</div>
</body>
</html>

