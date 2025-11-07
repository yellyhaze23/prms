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

// Auto-detect environment (Docker vs Laragon)
$isDocker = getenv('DB_HOST') !== false || file_exists('/.dockerenv');

// Get database credentials from environment or use defaults
if ($isDocker) {
    // Docker/Production Environment
    $host = getenv('DB_HOST') ?: 'db';
    $username = getenv('DB_USER') ?: 'prms_user';
    $password = getenv('DB_PASSWORD') ?: 'prms_pass_2024';
    $database = getenv('DB_NAME') ?: 'prms_db';
    
    // Backup directory for Docker - use persistent volume
    $backupDir = getenv('BACKUP_DIR') ?: '/var/www/html/backups/';
} else {
    // Laragon Localhost Environment
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $database = 'prms_db';
    
    // Backup directory for Laragon
    $backupDir = 'C:/laragon/backups/';
}

// Create backup directory if it doesn't exist
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0775, true);
    // Set ownership to www-data in Docker
    if ($isDocker) {
        @chown($backupDir, 'www-data');
        @chgrp($backupDir, 'www-data');
    }
}

// Ensure backupDir ends with / for proper path concatenation
$backupDir = rtrim($backupDir, '/') . '/';

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
    
    // Detect environment
    $isDocker = getenv('DB_HOST') !== false || file_exists('/.dockerenv');
    
    if ($isDocker) {
        // Docker/Production: Use docker exec to run mysqldump in db container
        $dbContainer = getenv('DB_CONTAINER_NAME') ?: 'prms-db';
        
        // Use prms_user instead of root (safer and should have proper permissions)
        $dbUser = getenv('DB_USER') ?: 'prms_user';
        $dbPass = getenv('DB_PASSWORD') ?: 'prms_pass_2024';
        
        // Use docker exec to run mysqldump and capture output in PHP
        // This is more reliable than file redirection
        $command = sprintf(
            'docker exec %s mysqldump --single-transaction --quick --lock-tables=false --routines --triggers --events --hex-blob --default-character-set=utf8mb4 -h localhost -u %s -p%s %s 2>&1',
            escapeshellarg($dbContainer),
            escapeshellarg($dbUser),
            escapeshellarg($dbPass),
            escapeshellarg($database)
        );
        
        // Execute backup and capture all output
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        // Combine output into backup content
        $backupContent = implode("\n", $output);
        
        // Check for docker permission errors or mysqldump errors
        if (strpos($backupContent, 'permission denied') !== false || 
            strpos($backupContent, 'docker.sock') !== false) {
            // Docker exec failed due to permissions, fallback to direct MySQL connection
            error_log("Docker exec permission denied, falling back to direct MySQL connection");
            return createBackupDirectMySQL($host, $username, $password, $database, $filepath, $filename);
        }
        
        // Check for mysqldump errors
        if ($returnCode !== 0 || 
            strpos($backupContent, 'mysqldump:') !== false || 
            strpos($backupContent, 'ERROR') !== false || 
            strpos($backupContent, 'Access denied') !== false ||
            strpos($backupContent, 'Got error') !== false) {
            error_log("Docker backup failed. Command: $command, Return code: $returnCode, Output: " . substr($backupContent, 0, 500));
            // Try fallback
            return createBackupDirectMySQL($host, $username, $password, $database, $filepath, $filename);
        }
        
        // Check if we have actual SQL content (should start with SQL comments or CREATE)
        if (empty($backupContent) || strlen($backupContent) < 100) {
            error_log("Docker backup produced empty or too small output. Size: " . strlen($backupContent));
            return false;
        }
        
        // Write backup content to file using PHP (handles permissions better)
        $bytesWritten = @file_put_contents($filepath, $backupContent);
        
        if ($bytesWritten !== false && $bytesWritten > 0 && file_exists($filepath)) {
            // Set proper permissions
            @chmod($filepath, 0664);
            if ($isDocker) {
                @chown($filepath, 'www-data');
                @chgrp($filepath, 'www-data');
            }
            
            return [
                'filename' => $filename,
                'size' => filesize($filepath),
                'created' => date('Y-m-d H:i:s')
            ];
        }
        
        error_log("Failed to write backup file. Bytes written: " . ($bytesWritten ?: 0) . ", Filepath: $filepath, Is writable: " . (is_writable(dirname($filepath)) ? 'yes' : 'no'));
        return false;
    } else {
        // Laragon/Windows: Try different mysqldump paths
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
        $command = sprintf(
            '"%s" --single-transaction --quick --lock-tables=false --routines --triggers --events --hex-blob --default-character-set=utf8mb4 -h "%s" -u "%s" -p"%s" "%s" > "%s" 2>&1',
            $mysqldump,
            $host,
            $username,
            $password,
            $database,
            $filepath
        );
        
        // Execute backup
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
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
}

// Fallback function: Create backup using direct MySQL connection (pure PHP)
function createBackupDirectMySQL($host, $user, $pass, $dbname, $filepath, $filename) {
    try {
        $conn = new mysqli($host, $user, $pass, $dbname);
        if ($conn->connect_error) {
            error_log("Backup PHP connection failed: " . $conn->connect_error);
            return false;
        }
        
        $conn->set_charset("utf8mb4");
        
        $sql = "-- MySQL Backup created with PHP\n";
        $sql .= "-- Date: " . date('Y-m-d H:i:s') . "\n";
        $sql .= "-- Server: " . $host . "\n";
        $sql .= "-- Database: " . $dbname . "\n\n";
        $sql .= "SET NAMES utf8mb4;\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
        
        // Get all tables
        $tables = [];
        $result = $conn->query("SHOW TABLES");
        if (!$result) {
            error_log("Failed to get tables: " . $conn->error);
            $conn->close();
            return false;
        }
        
        while ($row = $result->fetch_array()) {
            $tables[] = $row[0];
        }
        
        foreach ($tables as $table) {
            $sql .= "\n-- --------------------------------------------------------\n";
            $sql .= "-- Table structure for table `$table`\n";
            $sql .= "-- --------------------------------------------------------\n\n";
            $sql .= "DROP TABLE IF EXISTS `$table`;\n";
            
            // Get CREATE TABLE
            $createResult = $conn->query("SHOW CREATE TABLE `$table`");
            if ($createRow = $createResult->fetch_assoc()) {
                $sql .= $createRow['Create Table'] . ";\n\n";
            }
            
            // Get table data
            $dataResult = $conn->query("SELECT * FROM `$table`");
            if ($dataResult && $dataResult->num_rows > 0) {
                $sql .= "-- Dumping data for table `$table`\n\n";
                $sql .= "LOCK TABLES `$table` WRITE;\n";
                $sql .= "/*!40000 ALTER TABLE `$table` DISABLE KEYS */;\n\n";
                
                while ($dataRow = $dataResult->fetch_assoc()) {
                    $sql .= "INSERT INTO `$table` VALUES (";
                    $values = [];
                    foreach ($dataRow as $value) {
                        if ($value === null) {
                            $values[] = 'NULL';
                        } else {
                            $values[] = "'" . $conn->real_escape_string($value) . "'";
                        }
                    }
                    $sql .= implode(',', $values) . ");\n";
                }
                
                $sql .= "\n/*!40000 ALTER TABLE `$table` ENABLE KEYS */;\n";
                $sql .= "UNLOCK TABLES;\n\n";
            }
        }
        
        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        
        $conn->close();
        
        // Write to file
        $bytesWritten = @file_put_contents($filepath, $sql);
        if ($bytesWritten && file_exists($filepath) && filesize($filepath) > 0) {
            @chmod($filepath, 0664);
            @chown($filepath, 'www-data');
            @chgrp($filepath, 'www-data');
            
            return [
                'filename' => $filename,
                'size' => filesize($filepath),
                'created' => date('Y-m-d H:i:s')
            ];
        }
        
        error_log("Failed to write PHP backup file. Bytes: " . ($bytesWritten ?: 0));
        return false;
    } catch (Exception $e) {
        error_log("PHP backup failed: " . $e->getMessage());
        return false;
    }
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
                    
                    // Normalize path: ensure proper directory separator
                    $normalizedDir = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $backupDir), DIRECTORY_SEPARATOR);
                    $filepath = $normalizedDir . DIRECTORY_SEPARATOR . $filename;
                    
                    // Get canonical path (resolves symlinks, relative paths, etc.)
                    $canonicalPath = realpath($filepath);
                    if ($canonicalPath !== false) {
                        $filepath = $canonicalPath;
                    }
                    
                    // Get directory path for permission check
                    $dirPath = dirname($filepath);
                    
                    // Debug: Log the actual paths being used
                    $debugInfo = [
                        'filename' => $filename,
                        'backupDir' => $backupDir,
                        'normalizedDir' => $normalizedDir,
                        'filepath' => $filepath,
                        'dirPath' => $dirPath,
                        'file_exists' => file_exists($filepath),
                        'is_writable_file' => is_writable($filepath),
                        'is_writable_dir' => is_writable($dirPath),
                        'canonicalPath' => $canonicalPath,
                        'current_dir' => getcwd(),
                        'script_dir' => __DIR__
                    ];
                    
                    // Check if file exists
                    if (!file_exists($filepath)) {
                        sendResponse('error', 'Backup file does not exist: ' . $filename . ' | Debug: ' . json_encode($debugInfo));
                    }
                    
                    // Check if directory is writable (required for delete on Windows)
                    if (!is_writable($dirPath)) {
                        sendResponse('error', 'Backup directory is not writable. Cannot delete file. | Debug: ' . json_encode($debugInfo));
                    }
                    
                    // Helper function to check if file is locked
                    $isFileLocked = function($path) {
                        if (!file_exists($path)) {
                            return false;
                        }
                        // Try to open file for writing to check if it's locked
                        $handle = @fopen($path, 'r+');
                        if ($handle === false) {
                            return true; // File might be locked
                        }
                        fclose($handle);
                        return false;
                    };
                    
                    // Retry logic for file deletion (Windows file locking issue)
                    $maxRetries = 3;
                    $retryDelay = 500000; // 0.5 seconds in microseconds
                    $result = false;
                    $lastError = null;
                    
                    for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
                        // Check if file is locked before attempting deletion
                        if ($isFileLocked($filepath)) {
                            if ($attempt < $maxRetries) {
                                usleep($retryDelay * $attempt); // Exponential backoff
                                continue;
                            } else {
                                sendResponse('error', 'Backup file is locked by another process. Please close any applications using this file and try again. | Debug: ' . json_encode(array_merge($debugInfo, ['attempt' => $attempt])));
                                break;
                            }
                        }
                        
                        // Try to delete the file with error suppression to catch errors
                        $error = null;
                        set_error_handler(function($errno, $errstr) use (&$error) {
                            $error = $errstr;
                            return true;
                        });
                        
                        $result = @unlink($filepath);
                        restore_error_handler();
                        
                        if ($result) {
                            sendResponse('success', 'Backup file deleted successfully');
                            break;
                        } else {
                            $lastError = $error;
                            // If it's a "Resource temporarily unavailable" error, retry
                            if (strpos($error, 'Resource temporarily unavailable') !== false && $attempt < $maxRetries) {
                                usleep($retryDelay * $attempt); // Exponential backoff
                                continue;
                            } else {
                                // If it's not a retryable error or we've exhausted retries, return error
                                $errorMsg = $lastError ? ' Error: ' . $lastError : '';
                                sendResponse('error', 'Failed to delete backup file: ' . $filename . $errorMsg . ' (Attempt ' . $attempt . '/' . $maxRetries . ') | Debug: ' . json_encode(array_merge($debugInfo, ['attempt' => $attempt])));
                                break;
                            }
                        }
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
