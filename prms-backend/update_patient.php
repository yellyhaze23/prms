<?php
// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Use proper CORS handling
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['id']) ||
    !isset($data['full_name']) || empty($data['full_name']) ||
    !isset($data['date_of_birth']) || empty($data['date_of_birth']) ||
    !isset($data['sex']) || empty($data['sex']) ||
    !isset($data['address']) || empty($data['address'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: Full Name, Date of Birth, Gender, and Address are required.']);
    exit;
}

$id = (int)$data['id'];
$full_name = $data['full_name'];
$date_of_birth = $data['date_of_birth'];
$sex = $data['sex'];
$address = $data['address'];

// Calculate age from date of birth
$birthDate = new DateTime($date_of_birth);
$today = new DateTime();
$age = $today->diff($birthDate)->y;

// Update patient basic information using prepared statement
$stmt = $conn->prepare("UPDATE patients SET full_name = ?, date_of_birth = ?, sex = ?, age = ?, address = ? WHERE id = ?");
$stmt->bind_param("sssisi", $full_name, $date_of_birth, $sex, $age, $address, $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $id,
            'full_name' => $full_name,
            'date_of_birth' => $date_of_birth,
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
