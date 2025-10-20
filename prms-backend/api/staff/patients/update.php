<?php
// Start session BEFORE any headers
if (session_status() === PHP_SESSION_NONE) {
    session_name('STAFFSESSID');
    session_start();
}

require_once __DIR__ . '/../_init.php';

header('Content-Type: application/json');
$user = current_user_or_401();
$staffId = intval($user['id']);

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$patientId = intval($input['id'] ?? 0);
$full_name = trim($input['full_name'] ?? '');
$age = isset($input['age']) ? intval($input['age']) : null;
$sex = trim($input['sex'] ?? '');
$address = trim($input['address'] ?? '');
$date_of_birth = trim($input['date_of_birth'] ?? '');

if ($patientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid patient ID']);
    exit;
}

if ($full_name === '' || !$age || $sex === '' || $address === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Verify that the patient belongs to this staff member
$checkSql = "SELECT id FROM patients WHERE id = ? AND added_by = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("ii", $patientId, $staffId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Patient not found or access denied']);
    exit;
}

// Update patient information
$full_name_sql = $conn->real_escape_string($full_name);
$sex_sql = $conn->real_escape_string($sex);
$address_sql = $conn->real_escape_string($address);
$date_of_birth_sql = $date_of_birth ? "'" . $conn->real_escape_string($date_of_birth) . "'" : 'NULL';

$sql = "UPDATE patients SET 
        full_name = '$full_name_sql',
        age = $age,
        sex = '$sex_sql',
        address = '$address_sql',
        date_of_birth = $date_of_birth_sql
        WHERE id = $patientId AND added_by = $staffId";

if (!$conn->query($sql)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
    exit;
}

$data = [
    'id' => $patientId,
    'full_name' => $full_name,
    'age' => $age,
    'sex' => $sex,
    'address' => $address,
    'date_of_birth' => $date_of_birth,
];

echo json_encode(['success' => true, 'data' => $data]);
?>
