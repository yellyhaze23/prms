<?php
require_once __DIR__ . '/_init.php';
$user = current_user_or_401();

$patientId = intval($_GET['patient_id'] ?? 0);
if ($patientId <= 0) { json_ok([]); exit; }

$stmt = $conn->prepare("SELECT * FROM medical_records WHERE patient_id = ? ORDER BY last_checkup_date DESC LIMIT 10");
$stmt->bind_param('i', $patientId);
$stmt->execute();
$result = $stmt->get_result();
$list = [];
while ($row = $result->fetch_assoc()) { $list[] = $row; }
json_ok($list);
