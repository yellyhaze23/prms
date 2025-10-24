<?php
require 'cors.php';
require 'config.php';

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

// Update last activity for active users
if (isset($_SESSION['user_id'])) {
    $_SESSION['last_activity'] = time();
    echo json_encode(['success' => true, 'message' => 'Activity updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'No active session']);
}
?>
