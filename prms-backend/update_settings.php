<?php
require_once 'cors.php';
require_once 'config.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
  $input = $_POST; // fallback
}

$fields = [
  'clinic_name', 'clinic_address', 'clinic_phone', 'clinic_email',
  'map_default_center', 'map_default_zoom', 'forecast_default_days',
  'session_timeout_minutes', 'session_warning_minutes'
];

$updates = [];
$params = [];
$paramTypes = '';

foreach ($fields as $f) {
  if (isset($input[$f])) {
    $value = (string)$input[$f];
    $updates[] = "$f = ?";
    $params[] = $value;
    $paramTypes .= 's';
  }
}

if (count($updates) === 0) {
  echo json_encode(['success' => false, 'message' => 'No changes provided']);
  exit;
}

$sql = "UPDATE settings SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP WHERE id = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param($paramTypes, ...$params);
$ok = $stmt->execute();

if ($ok) {
  $res = $conn->prepare("SELECT * FROM settings WHERE id=1");
  $res->execute();
  $result = $res->get_result();
  $settings = $result->fetch_assoc();
  echo json_encode(['success' => true, 'message' => 'Settings updated', 'settings' => $settings]);
} else {
  echo json_encode(['success' => false, 'message' => 'Update failed', 'error' => $stmt->error]);
}
?>


