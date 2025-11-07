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
    $isAdmin = ($user['role'] === 'admin');
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Check login attempts for admin only
    if ($isAdmin) {
        $attemptSql = "SELECT attempts, locked_until FROM login_attempts WHERE username = ? AND ip_address = ?";
        $attemptStmt = $conn->prepare($attemptSql);
        $attemptStmt->bind_param("ss", $username, $ip_address);
        $attemptStmt->execute();
        $attemptResult = $attemptStmt->get_result();
        $attemptData = $attemptResult->fetch_assoc();
        
        // Check if account is locked
        if ($attemptData && $attemptData['locked_until'] && strtotime($attemptData['locked_until']) > time()) {
            $auditLogger->logLogin($user['id'], 'admin', $username, 'failed', 'Account locked due to too many attempts');
            echo json_encode([
                'success' => false, 
                'message' => 'Account locked due to too many failed attempts. Please use password reset.',
                'locked' => true,
                'attempts' => $attemptData['attempts'] ?? 0
            ]);
            exit;
        }
    }
    
    if (password_verify($password, $user['password'])) {
        $role = isset($user['role']) && $user['role'] ? $user['role'] : 'staff';
        
        // Clear login attempts on successful login
        if ($isAdmin) {
            $clearStmt = $conn->prepare("DELETE FROM login_attempts WHERE username = ? AND ip_address = ?");
            $clearStmt->bind_param("ss", $username, $ip_address);
            $clearStmt->execute();
        }
        
        // Log successful login
        $auditLogger->logLogin($user['id'], $role, $user['username'], 'success');
        
        // Configure session cookie parameters before starting session
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.gc_maxlifetime', 86400);
            
            session_set_cookie_params([
                'lifetime' => 86400,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            session_start();

	    error_log("authenticate.php: Session started with ID: " . session_id());
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
        // Failed login
        $auditLogger->logLogin($user['id'], 'unknown', $username, 'failed', 'Invalid password');
        
        // Track attempts for admin only
        if ($isAdmin) {
            if ($attemptData) {
                // Update existing record
                $newAttempts = ($attemptData['attempts'] ?? 0) + 1;
                $updateStmt = $conn->prepare("UPDATE login_attempts SET attempts = ?, last_attempt = NOW() WHERE username = ? AND ip_address = ?");
                $updateStmt->bind_param("iss", $newAttempts, $username, $ip_address);
                $updateStmt->execute();
                
                if ($newAttempts >= 5) {
                    // Lock account and trigger password reset
                    $lockedUntil = date('Y-m-d H:i:s', strtotime('+30 minutes'));
                    $lockStmt = $conn->prepare("UPDATE login_attempts SET locked_until = ? WHERE username = ? AND ip_address = ?");
                    $lockStmt->bind_param("sss", $lockedUntil, $username, $ip_address);
                    $lockStmt->execute();
                    
                    echo json_encode([
                        'success' => false,
                        'message' => 'Too many failed attempts. Password reset required.',
                        'locked' => true,
                        'attempts' => $newAttempts,
                        'requireReset' => true
                    ]);
                    exit;
                }
            } else {
                // Create new attempt record
                $insertStmt = $conn->prepare("INSERT INTO login_attempts (username, ip_address, attempts) VALUES (?, ?, 1)");
                $insertStmt->bind_param("ss", $username, $ip_address);
                $insertStmt->execute();
            }
        }
        
        echo json_encode([
            'success' => false, 
            'message' => 'Incorrect password',
            'attempts' => $isAdmin && isset($attemptData) ? ($attemptData['attempts'] ?? 0) + 1 : null
        ]);
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
