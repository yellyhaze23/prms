<?php
require 'cors.php';
require 'config.php';

// Configure session cookie parameters (same as authenticate.php)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', 1800);
    
    session_set_cookie_params([
        'lifetime' => 1800,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    // Use file-based sessions (simpler and more reliable for Docker)
    session_start();
}

// Check if session exists AND is admin role
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    // Get the first admin user from database
    $sql = "SELECT id, username, role FROM users WHERE role = 'admin' ORDER BY id LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Preserve last_activity if exists (prevents session timeout conflicts)
        $lastActivity = $_SESSION['last_activity'] ?? time();
        
        // Overwrite session with admin data (don't clear entire session)
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['name'] = $user['username'];
        $_SESSION['last_activity'] = $lastActivity;
        
        // Regenerate session ID for security (only on first initialization)
        if (!isset($_SESSION['session_initialized'])) {
            session_regenerate_id(true);
            $_SESSION['session_initialized'] = true;
        }
        
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
    // Session already exists AND is admin role, just update activity
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
