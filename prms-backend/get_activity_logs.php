<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

$user_type = $_GET['user_type'] ?? '';
$activity_type = $_GET['activity_type'] ?? '';
$date_from = $_GET['date_from'] ?? '';
$date_to = $_GET['date_to'] ?? '';
$limit = $_GET['limit'] ?? 1000;

$sql = "SELECT * FROM activity_logs WHERE 1=1";
$params = [];
$types = "";

if ($user_type) {
    $sql .= " AND user_type = ?";
    $params[] = $user_type;
    $types .= "s";
}

if ($activity_type) {
    $sql .= " AND activity_type LIKE ?";
    $params[] = "%$activity_type%";
    $types .= "s";
}

if ($date_from) {
    $sql .= " AND DATE(created_at) >= ?";
    $params[] = $date_from;
    $types .= "s";
}

if ($date_to) {
    $sql .= " AND DATE(created_at) <= ?";
    $params[] = $date_to;
    $types .= "s";
}

$sql .= " ORDER BY created_at DESC LIMIT ?";
$params[] = (int)$limit;
$types .= "i";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

echo json_encode($logs);
?>
