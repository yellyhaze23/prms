<?php
require 'cors.php';
require 'config.php';
require 'audit_logger.php';

header('Content-Type: application/json');

// Configure session cookie parameters (same as authenticate.php)
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Check if user is logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    $userId = $_SESSION['user_id'];
    $username = $_SESSION['username'];
    $userType = $_SESSION['role'] ?? 'admin';
    
    // Log logout
    $auditLogger->logLogout($userId, $userType, $username);
    
    // Destroy session completely
    $_SESSION = array();
    
    // Delete session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy session
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
} else {
    // No active session
    echo json_encode([
        'success' => true,
        'message' => 'No active session to logout'
    ]);
}
?>

