<?php
require 'cors.php';
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required patient ID.']);
    exit;
}

$patient_id = intval($data['id']);

// Escape all the new fields
$surname = mysqli_real_escape_string($conn, $data['surname'] ?? '');
$first_name = mysqli_real_escape_string($conn, $data['first_name'] ?? '');
$middle_name = mysqli_real_escape_string($conn, $data['middle_name'] ?? '');
$suffix = mysqli_real_escape_string($conn, $data['suffix'] ?? '');
$date_of_birth = mysqli_real_escape_string($conn, $data['date_of_birth'] ?? '');
$philhealth_id = mysqli_real_escape_string($conn, $data['philhealth_id'] ?? '');
$priority = mysqli_real_escape_string($conn, $data['priority'] ?? '');
$blood_pressure = mysqli_real_escape_string($conn, $data['blood_pressure'] ?? '');
$temperature = mysqli_real_escape_string($conn, $data['temperature'] ?? '');
$height = floatval($data['height'] ?? 0);
$weight = floatval($data['weight'] ?? 0);
$chief_complaint = mysqli_real_escape_string($conn, $data['chief_complaint'] ?? '');
$place_of_consultation = mysqli_real_escape_string($conn, $data['place_of_consultation'] ?? '');
$type_of_services = mysqli_real_escape_string($conn, $data['type_of_services'] ?? '');
$date_of_consultation = mysqli_real_escape_string($conn, $data['date_of_consultation'] ?? '');
$health_provider = mysqli_real_escape_string($conn, $data['health_provider'] ?? '');
$diagnosis = mysqli_real_escape_string($conn, $data['diagnosis'] ?? '');
$laboratory_procedure = mysqli_real_escape_string($conn, $data['laboratory_procedure'] ?? '');
$prescribed_medicine = mysqli_real_escape_string($conn, $data['prescribed_medicine'] ?? '');
$medical_advice = mysqli_real_escape_string($conn, $data['medical_advice'] ?? '');
$place_of_consultation_medical = mysqli_real_escape_string($conn, $data['place_of_consultation_medical'] ?? '');
$date_of_consultation_medical = mysqli_real_escape_string($conn, $data['date_of_consultation_medical'] ?? '');
$health_provider_medical = mysqli_real_escape_string($conn, $data['health_provider_medical'] ?? '');
$medical_remarks = mysqli_real_escape_string($conn, $data['medical_remarks'] ?? '');

// Automatically set consultation date to today if not explicitly provided
$auto_consultation_date = empty($date_of_consultation) ? "CURDATE()" : "'$date_of_consultation'";

$updateSql = "
    UPDATE medical_records SET
        surname = '$surname',
        first_name = '$first_name',
        middle_name = '$middle_name',
        suffix = '$suffix',
        date_of_birth = '$date_of_birth',
        philhealth_id = '$philhealth_id',
        priority = '$priority',
        blood_pressure = '$blood_pressure',
        temperature = '$temperature',
        height = $height,
        weight = $weight,
        chief_complaint = '$chief_complaint',
        place_of_consultation = '$place_of_consultation',
        type_of_services = '$type_of_services',
        date_of_consultation = $auto_consultation_date,
        health_provider = '$health_provider',
        diagnosis = '$diagnosis',
        laboratory_procedure = '$laboratory_procedure',
        prescribed_medicine = '$prescribed_medicine',
        medical_advice = '$medical_advice',
        place_of_consultation_medical = '$place_of_consultation_medical',
        date_of_consultation_medical = '$date_of_consultation_medical',
        health_provider_medical = '$health_provider_medical',
        medical_remarks = '$medical_remarks',
        updated_at = NOW()
    WHERE patient_id = $patient_id
";

if (!mysqli_query($conn, $updateSql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update medical record: ' . mysqli_error($conn)]);
    exit;
}

echo json_encode(['success' => true]);
?>
