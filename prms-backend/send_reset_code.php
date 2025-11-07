<?php
require 'cors.php';
require 'config.php';
require 'send_email.php';
require 'email_config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'] ?? '';

if (empty($username)) {
    echo json_encode(['success' => false, 'message' => 'Username is required']);
    exit;
}

// Find admin user
$sql = "SELECT id, username, email, full_name, role FROM users WHERE (username = ? OR email = ?) AND role = 'admin' AND status = 'active'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Admin account not found']);
    exit;
}

$user = $result->fetch_assoc();

if (empty($user['email'])) {
    echo json_encode(['success' => false, 'message' => 'No email address associated with this account']);
    exit;
}

// Delete any existing codes for this user
$deleteStmt = $conn->prepare("DELETE FROM password_reset_codes WHERE user_id = ? AND used = 0");
$deleteStmt->bind_param("i", $user['id']);
$deleteStmt->execute();

// Generate 6-digit code
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$expiresAt = date('Y-m-d H:i:s', time() + (10 * 60)); // Current time + 10 minutes

// Insert code
$insertStmt = $conn->prepare("INSERT INTO password_reset_codes (user_id, code, email, expires_at) VALUES (?, ?, ?, ?)");
$insertStmt->bind_param("isss", $user['id'], $code, $user['email'], $expiresAt);

if (!$insertStmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to generate reset code']);
    exit;
}

// Send email
$userName = $user['full_name'] ?: $user['username'];
$emailResult = sendVerificationCodeEmail($user['email'], $userName, $code);

if ($emailResult) {
      echo json_encode([
        'success' => true,
        'message' => 'Verification code has been sent to your email address.'
      ]);
} else {
    error_log("Failed to send verification code email to: " . $user['email']);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send email. Please check PHP error logs for details.',
        'debug' => 'Check Laragon PHP error logs for SMTP details'
    ]);
}
?>

