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

// fetch user by id or username
if ($userId > 0) {
  $res = mysqli_query($conn, "SELECT * FROM users WHERE id = $userId LIMIT 1");
} else {
  $unameEsc = mysqli_real_escape_string($conn, $username);
  $res = mysqli_query($conn, "SELECT * FROM users WHERE username = '".$unameEsc."' LIMIT 1");
}
$user = $res ? mysqli_fetch_assoc($res) : null;
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
$ok = mysqli_query($conn, "UPDATE users SET password='" . mysqli_real_escape_string($conn, $hash) . "' WHERE id=".$targetId);

if ($ok) {
  echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
} else {
  echo json_encode(['success' => false, 'message' => 'Failed to change password']);
}
?>


