<?php
// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../_init.php';

header('Content-Type: application/json');
$user = current_user_or_401();
$staffId = intval($user['id']);

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$full_name = trim($input['full_name'] ?? '');
$age = isset($input['age']) ? intval($input['age']) : null;
$sex = trim($input['sex'] ?? '');
$address = trim($input['address'] ?? '');
$contact_number = trim($input['contact_number'] ?? '');

if ($full_name === '' || !$age || $sex === '' || $address === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing required fields']);
  exit;
}

// Ensure added_by column exists
$colCheck = $conn->query("SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'added_by'");
$hasAddedBy = $colCheck && intval(($colCheck->fetch_assoc()['c'] ?? 0)) > 0;
if (!$hasAddedBy) {
  http_response_code(409);
  echo json_encode(['success' => false, 'error' => "Missing column patients.added_by. Run: ALTER TABLE patients ADD COLUMN added_by INT NULL;"]);
  exit;
}

$full_name_sql = $conn->real_escape_string($full_name);
$sex_sql = $conn->real_escape_string($sex);
$address_sql = $conn->real_escape_string($address);
$contact_sql = $conn->real_escape_string($contact_number);

$sql = "INSERT INTO patients (image_path, full_name, age, sex, date_of_birth, contact_number, email, address, added_by)
        VALUES ('lspu-logo.png', '$full_name_sql', $age, '$sex_sql', NULL, '$contact_sql', '', '$address_sql', $staffId)";

if (!$conn->query($sql)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
  exit;
}

$newId = $conn->insert_id;

// Optionally seed related rows like health_examinations/medical_records/diagnostics
// These are not critical for basic listing; uncomment if needed
// $conn->query("INSERT INTO health_examinations (patient_id) VALUES ($newId)");
// $conn->query("INSERT INTO medical_records (patient_id) VALUES ($newId)");
// $conn->query("INSERT INTO diagnostics (patient_id) VALUES ($newId)");

$data = [
  'id' => $newId,
  'full_name' => $full_name,
  'age' => $age,
  'sex' => $sex,
  'address' => $address,
  'contact_number' => $contact_number,
];

echo json_encode(['success' => true, 'data' => $data]);
