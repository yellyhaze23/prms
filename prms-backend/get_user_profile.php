<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

// Get user ID from query parameter
$user_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}

// Fetch user profile information
$sql = "SELECT id, username, full_name, email, phone, role, status, position, department, created_at FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user = $result->fetch_assoc();

echo json_encode(['success' => true, 'user' => $user]);
?>

