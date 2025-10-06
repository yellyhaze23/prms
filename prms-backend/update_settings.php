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
  'map_default_center', 'map_default_zoom', 'forecast_default_days'
];

$updates = [];
foreach ($fields as $f) {
  if (isset($input[$f])) {
    $value = mysqli_real_escape_string($conn, (string)$input[$f]);
    $updates[] = "$f = '" . $value . "'";
  }
}

if (count($updates) === 0) {
  echo json_encode(['success' => false, 'message' => 'No changes provided']);
  exit;
}

$sql = "UPDATE settings SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP WHERE id = 1";
$ok = mysqli_query($conn, $sql);

if ($ok) {
  $res = mysqli_query($conn, "SELECT * FROM settings WHERE id=1");
  $settings = mysqli_fetch_assoc($res);
  echo json_encode(['success' => true, 'message' => 'Settings updated', 'settings' => $settings]);
} else {
  echo json_encode(['success' => false, 'message' => 'Update failed', 'error' => mysqli_error($conn)]);
}
?>


