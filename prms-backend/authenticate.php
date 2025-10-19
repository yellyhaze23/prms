<?php
require 'cors.php';
require 'config.php';
require 'audit_logger.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    // Log failed login attempt
    $auditLogger->logLogin(0, 'unknown', $username, 'failed', 'Missing credentials');
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$sql = "SELECT * FROM users WHERE username = ? AND status = 'active'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        $role = isset($user['role']) && $user['role'] ? $user['role'] : 'staff';
        
        // Log successful login
        $auditLogger->logLogin($user['id'], $role, $user['username'], 'success');
        
        // Set session variables for all users
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $role;
        $_SESSION['name'] = $user['full_name'] ?? $user['username'];
        $_SESSION['last_activity'] = time(); // Set initial activity time
        
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
        echo json_encode(['success' => false, 'message' => 'Invalid password.']);
    }
} else {
    // Check if user exists but is inactive
    $checkSql = "SELECT id FROM users WHERE username = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $username);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 1) {
        // User exists but is inactive
        $auditLogger->logLogin(0, 'unknown', $username, 'failed', 'Account deactivated');
        echo json_encode(['success' => false, 'message' => 'Your account has been deactivated. Please contact an administrator.']);
    } else {
        // User doesn't exist
        $auditLogger->logLogin(0, 'unknown', $username, 'failed', 'User not found');
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }
}
?>
