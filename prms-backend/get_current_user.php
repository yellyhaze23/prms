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

// Only set last activity if it doesn't exist (for admin users)
if (isset($_SESSION['user_id']) && !isset($_SESSION['last_activity'])) {
    $_SESSION['last_activity'] = time();
}

// Check if user is logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    // Get user details from database
    $sql = "SELECT id, username, role FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['username'],
                'role' => $user['role'] ?? 'admin'
            ]
        ]);
    } else {
        // Fallback to session data
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username'],
                'name' => $_SESSION['name'] ?? $_SESSION['username'],
                'role' => $_SESSION['role'] ?? 'admin'
            ]
        ]);
    }
} else {
    // No session, get admin user from database (get the first user with admin role)
    $sql = "SELECT id, username, role FROM users WHERE role = 'admin' ORDER BY id LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    } else {
        // Fallback to default admin
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 1,
                'username' => 'admin',
                'name' => 'Admin',
                'role' => 'admin'
            ]
        ]);
    }
}
?>
