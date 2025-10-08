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

// Extract and sanitize name components
$first_name = mysqli_real_escape_string($conn, $data['first_name']);
$middle_name = mysqli_real_escape_string($conn, $data['middle_name'] ?? '');
$surname = mysqli_real_escape_string($conn, $data['surname']);
$suffix = mysqli_real_escape_string($conn, $data['suffix'] ?? '');

// Combine name components
$full_name = trim($first_name . ' ' . $middle_name . ' ' . $surname . ' ' . $suffix);

$date_of_birth = mysqli_real_escape_string($conn, $data['date_of_birth']);
$sex = mysqli_real_escape_string($conn, $data['sex']);
$address = mysqli_real_escape_string($conn, $data['address']);

// Additional medical record fields
$philhealth_id = mysqli_real_escape_string($conn, $data['philhealth_id'] ?? '');
$priority = mysqli_real_escape_string($conn, $data['priority'] ?? 'medium');

// Calculate age from date of birth
$birthDate = new DateTime($date_of_birth);
$today = new DateTime();
$age = $today->diff($birthDate)->y;

// Image handling removed - not needed

$sql = "INSERT INTO patients (full_name, age, sex, date_of_birth, address)
        VALUES ('$full_name', '$age', '$sex', '$date_of_birth', '$address')";

if (mysqli_query($conn, $sql)) {
    $newId = mysqli_insert_id($conn);

    // Create medical_records entry with all consolidated fields
    $medical_sql = "INSERT INTO medical_records (
        patient_id, 
        surname, first_name, middle_name, suffix,
        philhealth_id, priority,
        created_at, updated_at
    ) VALUES (
        $newId,
        '$surname', '$first_name', '$middle_name', '$suffix',
        '$philhealth_id', '$priority',
        NOW(), NOW()
    )";
    
    mysqli_query($conn, $medical_sql);

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
    echo json_encode(['success' => false, 'error' => 'Database error: ' . mysqli_error($conn)]);
}
?>
