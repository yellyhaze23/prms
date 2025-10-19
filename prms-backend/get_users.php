<?php
require 'cors.php';
require 'config.php';

header('Content-Type: application/json');

$sql = "SELECT id, username, role, status, created_at FROM users";
$result = $conn->query($sql);

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode(['success' => true, 'users' => $users]);
?>
