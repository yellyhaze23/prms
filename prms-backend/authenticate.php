<?php
require 'cors.php';
require 'config.php';
require 'audit_logger.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

// Validate input
if (empty($username) || empty($password)) {
    $auditLogger->logLogin(0, 'unknown', $username, 'failed', 'Missing credentials');
    echo json_encode(['success' => false, 'message' => 'Please enter both username and password']);
    exit;
}

// Check if input is an email or username
$sql = "SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 'active'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $role = isset($user['role']) && $user['role'] ? $user['role'] : 'staff';
        
        // Log successful login
        $auditLogger->logLogin($user['id'], $role, $user['username'], 'success');
        
        // Configure session cookie parameters before starting session
        if (session_status() === PHP_SESSION_NONE) {
            // Use /tmp for sessions (always available in containers)
            session_save_path('/tmp');
            session_set_cookie_params([
                'lifetime' => 86400,  // 24 hours
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
        
        // Clear any existing session data
        $_SESSION = array();
        
        // Regenerate session ID for security (prevents session fixation)
        session_regenerate_id(true);
        
        // Set new session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $role;
        $_SESSION['name'] = $user['full_name'] ?? $user['username'];
        $_SESSION['last_activity'] = time(); // Set initial activity time
        
        // Log session info for debugging (before closing)
        $sessionId = session_id();
        $sessionName = session_name();
        error_log("Login Success - Session ID: " . $sessionId);
        error_log("Login Success - Session Name: " . $sessionName);
        error_log("Login Success - User ID: " . $user['id']);
        error_log("Login Success - Role: " . $role);
        
        // Explicitly write and close session to ensure cookie is sent
        session_write_close();
        
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $role,
            ]
        ]);
    } else {
        // Log failed login attempt
        $auditLogger->logLogin($user['id'], 'unknown', $username, 'failed', 'Invalid password');
        echo json_encode(['success' => false, 'message' => 'Incorrect password']);
    }
} else {
    // Check if user exists but is inactive
    $checkSql = "SELECT id FROM users WHERE username = ? OR email = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ss", $username, $username);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 1) {
        // User exists but is inactive
        $auditLogger->logLogin(0, 'unknown', $username, 'failed', 'Account deactivated');
        echo json_encode(['success' => false, 'message' => 'Account deactivated. Contact administrator']);
    } else {
        // User doesn't exist
        $auditLogger->logLogin(0, 'unknown', $username, 'failed', 'User not found');
        echo json_encode(['success' => false, 'message' => 'Username or email not found']);
    }
}
?>
