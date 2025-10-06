<?php
// Disable error display to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Use proper CORS handling
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['full_name']) || empty($data['full_name']) ||
    !isset($data['date_of_birth']) || empty($data['date_of_birth']) ||
    !isset($data['sex']) || empty($data['sex']) ||
    !isset($data['address']) || empty($data['address'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: Full Name, Date of Birth, Gender, and Address are required.']);
    exit;
}

$full_name = mysqli_real_escape_string($conn, $data['full_name']);
$date_of_birth = mysqli_real_escape_string($conn, $data['date_of_birth']);
$sex = mysqli_real_escape_string($conn, $data['sex']);
$contact_number = mysqli_real_escape_string($conn, $data['contact_number'] ?? '');
$email = mysqli_real_escape_string($conn, $data['email'] ?? '');
$address = mysqli_real_escape_string($conn, $data['address']);

// Calculate age from date of birth
$birthDate = new DateTime($date_of_birth);
$today = new DateTime();
$age = $today->diff($birthDate)->y;

// Image handling removed - not needed

$sql = "INSERT INTO patients (full_name, age, sex, date_of_birth, contact_number, email, address)
        VALUES ('$full_name', '$age', '$sex', '$date_of_birth', '$contact_number', '$email', '$address')";

if (mysqli_query($conn, $sql)) {
    $newId = mysqli_insert_id($conn);

    mysqli_query($conn, "INSERT INTO health_examinations (patient_id) VALUES ($newId)");
    mysqli_query($conn, "INSERT INTO medical_records (patient_id) VALUES ($newId)");

    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $newId,
            'full_name' => $full_name,
            'sex' => $sex,
            'age' => $age,
            'contact_number' => $contact_number,
            'email' => $email,
            'address' => $address
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . mysqli_error($conn)]);
}
?>
