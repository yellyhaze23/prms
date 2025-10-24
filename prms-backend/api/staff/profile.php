<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  global $conn;
  
  // Fetch full user profile from database
  $stmt = $conn->prepare("SELECT username, full_name as name, email, phone FROM users WHERE id = ?");
  $stmt->bind_param("i", $user['id']);
  $stmt->execute();
  $result = $stmt->get_result();
  $profile = $result->fetch_assoc();
  
  if ($profile) {
    json_ok($profile);
  } else {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Profile not found']);
  }
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  global $conn;
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  
  // Validate required fields
  if (empty($input['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name is required']);
    exit;
  }
  
  if (empty($input['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email is required']);
    exit;
  }
  
  if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email format']);
    exit;
  }
  
  if (empty($input['phone'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Phone number is required']);
    exit;
  }
  
  // Update user profile in database
  $stmt = $conn->prepare("UPDATE users SET full_name = ?, email = ?, phone = ?, username = ? WHERE id = ?");
  $username = $input['username'] ?? $user['username'];
  $stmt->bind_param("ssssi", $input['name'], $input['email'], $input['phone'], $username, $user['id']);
  $result = $stmt->execute();
  
  // Get error if any
  if (!$result) {
    error_log("Profile update failed: " . $conn->error);
  }
  
  if ($result) {
    // Log the activity in audit_logs table
    $log_stmt = $conn->prepare("INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, description, ip_address, result) VALUES (?, ?, 'update', 'profile', ?, 'Updated profile information', ?, 'success')");
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $log_stmt->bind_param("isis", $user['id'], $user['username'], $user['id'], $ip);
    $log_stmt->execute();
    
    json_ok(['message' => 'Profile updated successfully', 'updated' => true]);
  } else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update profile']);
  }
  exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
