<?php
/**
 * Simple Logger - Lightweight audit logging that never fails
 * Falls back gracefully if anything goes wrong
 */

function simpleLog($conn, $userId, $userType, $username, $action, $entityType, $entityId, $data = null) {
    try {
        // Check if connection exists
        if (!$conn) {
            $logFile = __DIR__ . '/../../logs/simple_logger.log';
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - No database connection\n", FILE_APPEND);
            return false;
        }
        
        // Simple IP detection (no external dependencies)
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipAddress = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }
        
        // Convert IPv6 localhost to IPv4 for better readability
        if ($ipAddress === '::1' || $ipAddress === '::ffff:127.0.0.1') {
            $ipAddress = '127.0.0.1';
        }
        
        // Trim whitespace
        $ipAddress = trim($ipAddress);
        
        // Simple user agent
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 255);
        
        // Convert data to JSON if provided
        $newValues = $data ? json_encode($data) : null;
        
        // Simple insert query with prepared statement
        $sql = "INSERT INTO audit_logs (user_id, user_type, username, action, entity_type, entity_id, new_values, ip_address, user_agent, result) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'success')";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            $logFile = __DIR__ . '/../../logs/simple_logger.log';
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Prepare failed: " . $conn->error . "\n", FILE_APPEND);
            return false;
        }
        
        $stmt->bind_param("issssisss", $userId, $userType, $username, $action, $entityType, $entityId, $newValues, $ipAddress, $userAgent);
        
        if (!$stmt->execute()) {
            $logFile = __DIR__ . '/../../logs/simple_logger.log';
            file_put_contents($logFile, date('Y-m-d H:i:s') . " - Execute failed: " . $stmt->error . "\n", FILE_APPEND);
            $stmt->close();
            return false;
        }
        
        $stmt->close();
        
        // Log success for debugging
        $logFile = __DIR__ . '/../../logs/simple_logger.log';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Logged: $action on $entityType #$entityId by $username\n", FILE_APPEND);
        
        return true;
    } catch (Exception $e) {
        // Log the error to file
        $logFile = __DIR__ . '/../../logs/simple_logger.log';
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Exception: " . $e->getMessage() . "\n", FILE_APPEND);
        return false;
    }
}

