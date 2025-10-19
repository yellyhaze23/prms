<?php
require_once 'cors.php';
require_once 'config.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { $input = $_POST; }

$userId = isset($input['user_id']) ? (int)$input['user_id'] : 0;
$username = $input['username'] ?? '';
$old = $input['old_password'] ?? '';
$new = $input['new_password'] ?? '';

if (($userId <= 0 && $username === '') || $old === '' || $new === '') {
  echo json_encode(['success' => false, 'message' => 'Missing fields']);
  exit;
}

// fetch user by id or username using prepared statements
if ($userId > 0) {
  $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
  $stmt->bind_param("i", $userId);
} else {
  $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
  $stmt->bind_param("s", $username);
}
$stmt->execute();
$result = $stmt->get_result();
$user = $result ? $result->fetch_assoc() : null;
if (!$user) {
  echo json_encode(['success' => false, 'message' => 'User not found']);
  exit;
}

// verify old password (bcrypt)
if (!password_verify($old, $user['password'])) {
  echo json_encode(['success' => false, 'message' => 'Old password is incorrect']);
  exit;
}

$hash = password_hash($new, PASSWORD_BCRYPT);
$targetId = $userId > 0 ? $userId : (int)$user['id'];
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param("si", $hash, $targetId);
$ok = $stmt->execute();

if ($ok) {
  echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
} else {
  echo json_encode(['success' => false, 'message' => 'Failed to change password']);
}
?>


