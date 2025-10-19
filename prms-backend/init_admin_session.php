<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Initialize admin session if not already set
if (!isset($_SESSION['user_id'])) {
    // Get the first admin user from database
    $sql = "SELECT id, username, role FROM users WHERE role = 'admin' ORDER BY id LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['name'] = $user['username'];
        $_SESSION['last_activity'] = time();
        
        echo json_encode([
            'success' => true,
            'message' => 'Admin session initialized',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No admin user found'
        ]);
    }
} else {
    // Session already exists, just update activity
    $_SESSION['last_activity'] = time();
    echo json_encode([
        'success' => true,
        'message' => 'Session already exists',
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role' => $_SESSION['role']
        ]
    ]);
}
?>
