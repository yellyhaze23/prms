<?php
// Start output buffering to prevent any HTML output
ob_start();

// Disable error reporting to prevent HTML error messages
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'prms';

// Backup directory - Save outside web root for security
$backupDir = 'C:/laragon/backups/';

// Create backup directory if it doesn't exist
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

function sendResponse($status, $message, $data = null) {
    // Clean any output buffer to prevent HTML contamination
    ob_clean();
    
    $response = [
        'status' => $status,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

function getBackupFiles() {
    global $backupDir;
    $files = [];
    
    // Debug: Log the backup directory path
    $debugInfo = [
        'backupDir' => $backupDir,
        'dir_exists' => is_dir($backupDir),
        'current_dir' => getcwd(),
        'script_dir' => __DIR__
    ];
    
    if (is_dir($backupDir)) {
        $dirFiles = scandir($backupDir);
        foreach ($dirFiles as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                $filePath = $backupDir . $file;
                $files[] = [
                    'filename' => $file,
                    'size' => filesize($filePath),
                    'created' => date('Y-m-d H:i:s', filemtime($filePath))
                ];
            }
        }
        // Sort by creation time (newest first)
        usort($files, function($a, $b) {
            return strtotime($b['created']) - strtotime($a['created']);
        });
    }
    
    // Always return an array, never add debug info to the response
    return $files;
}

function getDatabaseSize() {
    global $host, $username, $password, $database;
    
    try {
        $mysqli = new mysqli($host, $username, $password, $database);
        if ($mysqli->connect_error) {
            return 0;
        }
        
        $result = $mysqli->query("
            SELECT 
                ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'DB Size in MB'
            FROM information_schema.tables 
            WHERE table_schema = '$database'
        ");
        
        if ($result && $row = $result->fetch_assoc()) {
            $size = $row['DB Size in MB'] * 1024 * 1024; // Convert to bytes
            $mysqli->close();
            return $size;
        }
        
        $mysqli->close();
        return 0;
    } catch (Exception $e) {
        return 0;
    }
}

function createBackup() {
    global $host, $username, $password, $database, $backupDir;
    
    $timestamp = date('Y-m-d_H-i-s');
    $filename = "backup_{$timestamp}.sql";
    $filepath = $backupDir . $filename;
    
    // Try different mysqldump paths
    $mysqldumpPaths = [
        'mysqldump',
        'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe',
        'C:\\xampp\\mysql\\bin\\mysqldump.exe',
        'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe'
    ];
    
    $mysqldump = null;
    foreach ($mysqldumpPaths as $path) {
        if (is_executable($path) || shell_exec("where $path")) {
            $mysqldump = $path;
            break;
        }
    }
    
    if (!$mysqldump) {
        // Fallback: try to find mysqldump in common locations
        $mysqldump = 'mysqldump';
    }
    
    // Create optimized mysqldump command with proper escaping
    $command = "\"$mysqldump\" --single-transaction --quick --lock-tables=false --routines --triggers --events --hex-blob --default-character-set=utf8mb4 -h \"$host\" -u \"$username\" -p\"$password\" \"$database\" > \"$filepath\"";
    
    // Execute backup
    $output = [];
    $returnCode = 0;
    exec($command . ' 2>&1', $output, $returnCode);
    
    if ($returnCode === 0 && file_exists($filepath) && filesize($filepath) > 0) {
        return [
            'filename' => $filename,
            'size' => filesize($filepath),
            'created' => date('Y-m-d H:i:s')
        ];
    }
    
    // Log the error for debugging
    error_log("Backup failed. Command: $command, Return code: $returnCode, Output: " . implode("\n", $output));
    
    return false;
}

function restoreBackup($filename) {
    global $host, $username, $password, $database, $backupDir;
    
    $filepath = $backupDir . $filename;
    
    if (!file_exists($filepath)) {
        return false;
    }
    
    // Read the backup file
    $sql = file_get_contents($filepath);
    if ($sql === false) {
        return false;
    }
    
    // Connect to database
    $mysqli = new mysqli($host, $username, $password, $database);
    if ($mysqli->connect_error) {
        return false;
    }
    
    // Disable foreign key checks
    $mysqli->query("SET FOREIGN_KEY_CHECKS = 0");
    
    // Split SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    $success = true;
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            if (!$mysqli->query($statement)) {
                $success = false;
                break;
            }
        }
    }
    
    // Re-enable foreign key checks
    $mysqli->query("SET FOREIGN_KEY_CHECKS = 1");
    $mysqli->close();
    
    return $success;
}

function deleteBackup($filename) {
    global $backupDir;
    
    $filepath = $backupDir . $filename;
    
    // Check if file exists
    if (!file_exists($filepath)) {
        return false;
    }
    
    // Check if file is writable
    if (!is_writable($filepath)) {
        return false;
    }
    
    // Try to delete the file
    $result = unlink($filepath);
    
    return $result;
}

function downloadBackup($filename) {
    global $backupDir;
    
    $filepath = $backupDir . $filename;
    
    if (file_exists($filepath)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit();
    }
    
    return false;
}

// Handle the request
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            switch ($action) {
                case 'list':
                    $files = getBackupFiles();
                    sendResponse('success', 'Backup files retrieved successfully', $files);
                    break;
                    
                case 'size':
                    $size = getDatabaseSize();
                    sendResponse('success', 'Database size retrieved successfully', $size);
                    break;
                    
                case 'download':
                    $filename = $_GET['file'] ?? '';
                    if (empty($filename)) {
                        sendResponse('error', 'Filename is required');
                    }
                    
                    if (downloadBackup($filename)) {
                        exit();
                    } else {
                        sendResponse('error', 'File not found or could not be downloaded');
                    }
                    break;
                    
                default:
                    sendResponse('error', 'Invalid action');
            }
            break;
            
        case 'POST':
            switch ($action) {
                case 'backup':
                    $result = createBackup();
                    if ($result) {
                        sendResponse('success', 'Backup created successfully', $result);
                    } else {
                        sendResponse('error', 'Failed to create backup');
                    }
                    break;
                    
                case 'restore':
                    $filename = $_POST['file'] ?? '';
                    if (empty($filename)) {
                        sendResponse('error', 'Filename is required');
                    }
                    
                    if (restoreBackup($filename)) {
                        sendResponse('success', 'Database restored successfully');
                    } else {
                        sendResponse('error', 'Failed to restore database');
                    }
                    break;
                    
                case 'delete':
                    $filename = $_POST['file'] ?? '';
                    
                    if (empty($filename)) {
                        sendResponse('error', 'Filename is required');
                    }
                    
                    $filepath = $backupDir . $filename;
                    
                    // Debug: Log the actual paths being used
                    $debugInfo = [
                        'filename' => $filename,
                        'backupDir' => $backupDir,
                        'filepath' => $filepath,
                        'file_exists' => file_exists($filepath),
                        'is_writable' => is_writable($filepath),
                        'current_dir' => getcwd(),
                        'script_dir' => __DIR__
                    ];
                    
                    // Check if file exists
                    if (!file_exists($filepath)) {
                        sendResponse('error', 'Backup file does not exist: ' . $filename . ' | Debug: ' . json_encode($debugInfo));
                    }
                    
                    // Check if file is writable
                    if (!is_writable($filepath)) {
                        sendResponse('error', 'Backup file is not writable: ' . $filename . ' | Debug: ' . json_encode($debugInfo));
                    }
                    
                    // Try to delete the file
                    if (unlink($filepath)) {
                        sendResponse('success', 'Backup file deleted successfully');
                    } else {
                        sendResponse('error', 'Failed to delete backup file: ' . $filename . ' | Debug: ' . json_encode($debugInfo));
                    }
                    break;
                    
                default:
                    sendResponse('error', 'Invalid action');
            }
            break;
            
        default:
            sendResponse('error', 'Method not allowed');
    }
} catch (Exception $e) {
    sendResponse('error', 'Server error: ' . $e->getMessage());
}

// Clean any output and ensure only JSON is returned
ob_clean();
?>
