<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';
$code = $data['code'] ?? '';
$newPassword = $data['password'] ?? '';

if (empty($username) || empty($code) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => 'Username, code, and password are required']);
    exit;
}

// Validate password strength
if (strlen($newPassword) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
    exit;
}

// Find admin user
$sql = "SELECT id FROM users WHERE (username = ? OR email = ?) AND role = 'admin' AND status = 'active'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Admin account not found']);
    exit;
}

$user = $result->fetch_assoc();
$userId = $user['id'];

// Trim and clean the code (remove any spaces)
$code = trim($code);

// Verify code - check both MySQL NOW() and PHP time comparison
$codeSql = "SELECT id, attempts, expires_at FROM password_reset_codes WHERE user_id = ? AND code = ? AND used = 0";
$codeStmt = $conn->prepare($codeSql);
$codeStmt->bind_param("is", $userId, $code);
$codeStmt->execute();
$codeResult = $codeStmt->get_result();

// Filter by expiration in PHP to avoid timezone issues
$validCode = null;
while ($row = $codeResult->fetch_assoc()) {
    $expiresAt = strtotime($row['expires_at']);
    $now = time();
    
    if ($expiresAt > $now) {
        $validCode = $row;
        break;
    }
}

if (!$validCode) {
    // Check if code exists but is expired or used
    $checkSql = "SELECT id, used, expires_at, attempts FROM password_reset_codes WHERE user_id = ? AND code = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("is", $userId, $code);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    // Code exists but is expired or used - error already logged above
    
    // Increment attempts
    $updateAttemptsStmt = $conn->prepare("UPDATE password_reset_codes SET attempts = attempts + 1 WHERE user_id = ? AND code = ?");
    $updateAttemptsStmt->bind_param("is", $userId, $code);
    $updateAttemptsStmt->execute();
    
    echo json_encode([
        'success' => false,
        'message' => 'Invalid or expired verification code. Please try again.'
    ]);
    exit;
}

$codeData = $validCode;

// Check if code has too many attempts (max 5)
if ($codeData['attempts'] >= 5) {
    // Mark code as used to prevent further attempts
    $markUsedStmt = $conn->prepare("UPDATE password_reset_codes SET used = 1 WHERE id = ?");
    $markUsedStmt->bind_param("i", $codeData['id']);
    $markUsedStmt->execute();
    
    echo json_encode([
        'success' => false,
        'message' => 'Too many failed verification attempts. Please request a new code.'
    ]);
    exit;
}

// Code is valid - reset password
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
$updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$updateStmt->bind_param("si", $hashedPassword, $userId);

if (!$updateStmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to update password']);
    exit;
}

// Mark code as used
$markUsedStmt = $conn->prepare("UPDATE password_reset_codes SET used = 1 WHERE id = ?");
$markUsedStmt->bind_param("i", $codeData['id']);
$markUsedStmt->execute();

// Clear login attempts
$clearAttemptsStmt = $conn->prepare("DELETE FROM login_attempts WHERE username = ?");
$clearAttemptsStmt->bind_param("s", $username);
$clearAttemptsStmt->execute();

echo json_encode([
    'success' => true,
    'message' => 'Password has been reset successfully. You can now login with your new password.'
]);
?>

