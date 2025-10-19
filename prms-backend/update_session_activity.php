<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
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
