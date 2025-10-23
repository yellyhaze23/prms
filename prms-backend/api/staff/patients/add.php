<?php
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
$date_of_birth = trim($input['date_of_birth'] ?? '');
$barangay_id = isset($input['barangay_id']) && $input['barangay_id'] ? intval($input['barangay_id']) : null;

if ($full_name === '' || !$age || $sex === '' || $address === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing required fields (name, age, sex, address)']);
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

// Create medical record with additional fields
$surname = $conn->real_escape_string($input['surname'] ?? '');
$first_name = $conn->real_escape_string($input['first_name'] ?? '');
$middle_name = $conn->real_escape_string($input['middle_name'] ?? '');
$suffix = $conn->real_escape_string($input['suffix'] ?? '');
$philhealth_id = $conn->real_escape_string($input['philhealth_id'] ?? '');
$priority = $conn->real_escape_string($input['priority'] ?? 'medium');

// Get barangay name
$barangayName = '';
if ($barangay_id) {
    $barangayResult = $conn->query("SELECT name FROM barangays WHERE id = $barangay_id");
    if ($barangayResult && $barangayResult->num_rows > 0) {
        $barangayName = $barangayResult->fetch_assoc()['name'];
    }
}

// Create medical record entry
$medicalRecordSql = "INSERT INTO medical_records 
    (patient_id, surname, first_name, middle_name, suffix, date_of_birth, barangay, philhealth_id, priority) 
    VALUES 
    ($newId, '$surname', '$first_name', '$middle_name', '$suffix', $date_of_birth_sql, '" . $conn->real_escape_string($barangayName) . "', '$philhealth_id', '$priority')";
    
$conn->query($medicalRecordSql);

$data = [
  'id' => $newId,
  'full_name' => $full_name,
  'age' => $age,
  'sex' => $sex,
  'address' => $address,
  'date_of_birth' => $date_of_birth,
  'barangay_id' => $barangay_id,
];

echo json_encode(['success' => true, 'data' => $data]);
