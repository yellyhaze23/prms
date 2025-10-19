<?php
// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Use proper CORS handling
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['first_name']) || empty($data['first_name']) ||
    !isset($data['surname']) || empty($data['surname']) ||
    !isset($data['date_of_birth']) || empty($data['date_of_birth']) ||
    !isset($data['sex']) || empty($data['sex']) ||
    !isset($data['address']) || empty($data['address'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: First Name, Surname, Date of Birth, Gender, and Address are required.']);
    exit;
}

// Get input data without escaping (prepared statements will handle it)
$first_name = $data['first_name'];
$middle_name = $data['middle_name'] ?? '';
$surname = $data['surname'];
$suffix = $data['suffix'] ?? '';

// Combine name components
$full_name = trim($first_name . ' ' . $middle_name . ' ' . $surname . ' ' . $suffix);

$date_of_birth = $data['date_of_birth'];
$sex = $data['sex'];
$address = $data['address'];

// Additional medical record fields
$philhealth_id = $data['philhealth_id'] ?? '';
$priority = $data['priority'] ?? 'medium';

// Calculate age from date of birth
$birthDate = new DateTime($date_of_birth);
$today = new DateTime();
$age = $today->diff($birthDate)->y;

// Insert patient using prepared statement
$stmt = $conn->prepare("INSERT INTO patients (full_name, age, sex, date_of_birth, address) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sisss", $full_name, $age, $sex, $date_of_birth, $address);

if ($stmt->execute()) {
    $newId = $conn->insert_id;

    // Create medical_records entry using prepared statement
    $medical_stmt = $conn->prepare("INSERT INTO medical_records (patient_id, surname, first_name, middle_name, suffix, philhealth_id, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $medical_stmt->bind_param("issssss", $newId, $surname, $first_name, $middle_name, $suffix, $philhealth_id, $priority);
    
    $medical_stmt->execute();

    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $newId,
            'full_name' => $full_name,
            'sex' => $sex,
            'age' => $age,
            'address' => $address
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $stmt->error]);
}
?>
