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

$imageData = $data['image'] ?? null;
$imageFileName = null;

if ($imageData && preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
    $imageData = substr($imageData, strpos($imageData, ',') + 1);
    $type = strtolower($type[1]);

    if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Unsupported image type.']);
        exit;
    }

    $imageData = base64_decode($imageData);
    if ($imageData === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid base64 image data.']);
        exit;
    }

    $imageFileName = 'profile_' . $patient_id . '_' . time() . '.' . $type;
    $imageFilePath = __DIR__ . '/uploads/' . $imageFileName;

    if (!file_put_contents($imageFilePath, $imageData)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save image to server.']);
        exit;
    }
}

$patient_code = mysqli_real_escape_string($conn, $data['patient_id'] ?? '');
$full_name = mysqli_real_escape_string($conn, $data['full_name'] ?? '');
$age = intval($data['age'] ?? 0);
$sex = mysqli_real_escape_string($conn, $data['sex'] ?? '');
$date_of_birth = mysqli_real_escape_string($conn, $data['date_of_birth'] ?? null);
$civil_status = mysqli_real_escape_string($conn, $data['civil_status'] ?? '');
$place_of_birth = mysqli_real_escape_string($conn, $data['place_of_birth'] ?? '');
$contact_number = mysqli_real_escape_string($conn, $data['contact_number'] ?? '');
$address = mysqli_real_escape_string($conn, $data['address'] ?? '');
$course_year_section = $data['course_year_section'] ?? '';
$department = $data['department'] ?? '';
$mother_name = mysqli_real_escape_string($conn, $data['mother_name'] ?? '');
$father_name = mysqli_real_escape_string($conn, $data['father_name'] ?? '');
$guardian_name = mysqli_real_escape_string($conn, $data['guardian_name'] ?? '');
$emergency_name = mysqli_real_escape_string($conn, $data['emergency_name'] ?? '');
$emergency_relation = mysqli_real_escape_string($conn, $data['emergency_relation'] ?? '');
$emergency_contact = mysqli_real_escape_string($conn, $data['emergency_contact'] ?? '');

$imageUpdateSql = $imageFileName ? ", image_path = '" . mysqli_real_escape_string($conn, $imageFileName) . "'" : '';

$updatePatientSql = "
    UPDATE patients SET
        patient_id = '$patient_code',
        full_name = '$full_name',
        age = $age,
        sex = '$sex',
        date_of_birth = '$date_of_birth',
        civil_status = '$civil_status',
        place_of_birth = '$place_of_birth',
        contact_number = '$contact_number',
        address = '$address',
        emergency_name = '$emergency_name',
        emergency_relation = '$emergency_relation',
        emergency_contact = '$emergency_contact'
        $imageUpdateSql
    WHERE id = $patient_id
";

if (!mysqli_query($conn, $updatePatientSql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update patient info: ' . mysqli_error($conn)]);
    exit;
}

$exam_date = mysqli_real_escape_string($conn, $data['exam_date'] ?? date('Y-m-d'));
$blood_pressure = mysqli_real_escape_string($conn, $data['blood_pressure'] ?? '');
$height = floatval($data['height'] ?? 0);
$weight = floatval($data['weight'] ?? 0);
$bmi = floatval($data['bmi'] ?? 0);
$ideal_weight = floatval($data['ideal_weight'] ?? 0);
$vision_with_glasses = mysqli_real_escape_string($conn, $data['vision_with_glasses'] ?? '');
$vision_without_glasses = mysqli_real_escape_string($conn, $data['vision_without_glasses'] ?? '');
$eent = mysqli_real_escape_string($conn, $data['eent'] ?? '');
$lungs = mysqli_real_escape_string($conn, $data['lungs'] ?? '');
$heart = mysqli_real_escape_string($conn, $data['heart'] ?? '');
$abdomen = mysqli_real_escape_string($conn, $data['abdomen'] ?? '');
$extremities = mysqli_real_escape_string($conn, $data['extremities'] ?? '');
$previous_illness = mysqli_real_escape_string($conn, $data['previous_illness'] ?? '');
$diagnosis = mysqli_real_escape_string($conn, $data['diagnosis'] ?? '');
$recommendation = mysqli_real_escape_string($conn, $data['recommendation'] ?? '');
$onset_date = mysqli_real_escape_string($conn, $data['onset_date'] ?? '');
$diagnosis_date = mysqli_real_escape_string($conn, $data['diagnosis_date'] ?? '');
$severity = mysqli_real_escape_string($conn, $data['severity'] ?? '');
$status = mysqli_real_escape_string($conn, $data['status'] ?? '');
$symptoms = mysqli_real_escape_string($conn, $data['symptoms'] ?? '');
$treatment = mysqli_real_escape_string($conn, $data['treatment'] ?? '');
$vaccination_status = mysqli_real_escape_string($conn, $data['vaccination_status'] ?? '');
$contact_tracing = mysqli_real_escape_string($conn, $data['contact_tracing'] ?? '');
$notes = mysqli_real_escape_string($conn, $data['notes'] ?? '');
$reported_by = mysqli_real_escape_string($conn, $data['reported_by'] ?? '');
$reported_date = mysqli_real_escape_string($conn, $data['reported_date'] ?? '');

$examImageSql = $imageFileName ? ", image_path = '" . mysqli_real_escape_string($conn, $imageFileName) . "'" : '';

$updateExamSql = "
    UPDATE health_examinations SET
        exam_date = '$exam_date',
        blood_pressure = '$blood_pressure',
        height = $height,
        weight = $weight,
        bmi = $bmi,
        ideal_weight = $ideal_weight,
        vision_with_glasses = '$vision_with_glasses',
        vision_without_glasses = '$vision_without_glasses',
        eent = '$eent',
        lungs = '$lungs',
        heart = '$heart',
        abdomen = '$abdomen',
        extremities = '$extremities',
        previous_illness = '$previous_illness',
        diagnosis = '$diagnosis',
        recommendation = '$recommendation',
        onset_date = '$onset_date',
        diagnosis_date = '$diagnosis_date',
        severity = '$severity',
        status = '$status',
        symptoms = '$symptoms',
        treatment = '$treatment',
        vaccination_status = '$vaccination_status',
        contact_tracing = '$contact_tracing',
        notes = '$notes',
        reported_by = '$reported_by',
        reported_date = '$reported_date',
        updated_at = NOW()
        $examImageSql
    WHERE patient_id = $patient_id
";

if (!mysqli_query($conn, $updateExamSql)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update health examination: ' . mysqli_error($conn)]);
    exit;
}

echo json_encode(['success' => true, 'image_path' => $imageFileName]);
?>
