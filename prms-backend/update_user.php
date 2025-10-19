<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$username = $data['username'] ?? null;
$oldPassword = $data['oldPassword'] ?? null;
$newPassword = $data['password'] ?? null;
$role = $data['role'] ?? null;
$status = $data['status'] ?? null;

if (!$id || (!$username && !$newPassword && !$role && !$status)) {
    echo json_encode(['success' => false, 'message' => 'User ID and at least one field (username, password, role, or status) are required.']);
    exit;
}

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit;
}

$currentUser = $result->fetch_assoc();

if ($newPassword) {
    if (!$oldPassword || !password_verify($oldPassword, $currentUser['password'])) {
        echo json_encode(['success' => false, 'message' => 'Old password is incorrect.']);
        exit;
    }
}

$updates = [];
$params = [];
$types = '';

if ($username) {
    $updates[] = "username = ?";
    $params[] = $username;
    $types .= 's';
}

if ($newPassword) {
    $updates[] = "password = ?";
    $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
    $types .= 's';
}

if ($role) {
    $updates[] = "role = ?";
    $params[] = $role;
    $types .= 's';
}

if ($status) {
    $updates[] = "status = ?";
    $params[] = $status;
    $types .= 's';
}

$params[] = $id;
$types .= 'i';

$sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'User updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}
?>
