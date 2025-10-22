<?php
// Start session BEFORE any headers
if (session_status() === PHP_SESSION_NONE) {
    session_name('STAFFSESSID');
    session_start();
}

// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../_init.php';

if (!headers_sent()) {
    header('Content-Type: application/json');
}
$user = current_user_or_401();
$staffId = intval($user['id']);

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$full_name = trim($input['full_name'] ?? '');
$age = isset($input['age']) ? intval($input['age']) : null;
$sex = trim($input['sex'] ?? '');
$address = trim($input['address'] ?? '');
$contact_number = trim($input['contact_number'] ?? '');
$date_of_birth = trim($input['date_of_birth'] ?? '');
$barangay_id = isset($input['barangay_id']) ? intval($input['barangay_id']) : null;

if ($full_name === '' || !$age || $sex === '' || $address === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing required fields']);
  exit;
}

$full_name_sql = $conn->real_escape_string($full_name);
$sex_sql = $conn->real_escape_string($sex);
$address_sql = $conn->real_escape_string($address);
$date_of_birth_sql = $date_of_birth ? "'" . $conn->real_escape_string($date_of_birth) . "'" : 'NULL';
$barangay_id_sql = $barangay_id ? $barangay_id : 'NULL';

$sql = "INSERT INTO patients (full_name, age, sex, address, date_of_birth, barangay_id, added_by)
        VALUES ('$full_name_sql', $age, '$sex_sql', '$address_sql', $date_of_birth_sql, $barangay_id_sql, $staffId)";

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
  'date_of_birth' => $date_of_birth,
];

echo json_encode(['success' => true, 'data' => $data]);
