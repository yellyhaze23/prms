<?php
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
$barangay_id = isset($input['barangay_id']) && $input['barangay_id'] ? intval($input['barangay_id']) : null;

if ($patientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid patient ID']);
    exit;
}

if ($full_name === '' || !$age || $sex === '' || $address === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields (name, age, sex, address)']);
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
$barangay_id_sql = $barangay_id ? $barangay_id : 'NULL';

$sql = "UPDATE patients SET 
        full_name = '$full_name_sql',
        age = $age,
        sex = '$sex_sql',
        address = '$address_sql',
        date_of_birth = $date_of_birth_sql,
        barangay_id = $barangay_id_sql
        WHERE id = $patientId AND added_by = $staffId";

if (!$conn->query($sql)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
    exit;
}

// Update medical records with additional fields
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

// Update or insert medical record
$mrCheckSql = "SELECT id FROM medical_records WHERE patient_id = $patientId LIMIT 1";
$mrCheckResult = $conn->query($mrCheckSql);

if ($mrCheckResult && $mrCheckResult->num_rows > 0) {
    // Update existing medical record
    $mrUpdateSql = "UPDATE medical_records SET 
        surname = '$surname',
        first_name = '$first_name',
        middle_name = '$middle_name',
        suffix = '$suffix',
        date_of_birth = $date_of_birth_sql,
        barangay = '" . $conn->real_escape_string($barangayName) . "',
        philhealth_id = '$philhealth_id',
        priority = '$priority'
        WHERE patient_id = $patientId
        LIMIT 1";
    $conn->query($mrUpdateSql);
} else {
    // Insert new medical record
    $mrInsertSql = "INSERT INTO medical_records 
        (patient_id, surname, first_name, middle_name, suffix, date_of_birth, barangay, philhealth_id, priority) 
        VALUES 
        ($patientId, '$surname', '$first_name', '$middle_name', '$suffix', $date_of_birth_sql, '" . $conn->real_escape_string($barangayName) . "', '$philhealth_id', '$priority')";
    $conn->query($mrInsertSql);
}

$data = [
    'id' => $patientId,
    'full_name' => $full_name,
    'age' => $age,
    'sex' => $sex,
    'address' => $address,
    'date_of_birth' => $date_of_birth,
    'barangay_id' => $barangay_id,
];

echo json_encode(['success' => true, 'data' => $data]);
?>
