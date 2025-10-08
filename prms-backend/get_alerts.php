<?php
require 'config.php';
require 'cors.php';

$response = [
    'followUps' => [],
    'incompleteHealthExams' => [],
    'incompleteMedicalRecords' => [],
];

$followUpQuery = "
    SELECT p.id, p.full_name, ci.follow_up_date
    FROM clinical_impression ci
    JOIN patients p ON ci.patient_id = p.id
    WHERE ci.follow_up_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
";
$followUpsResult = $conn->query($followUpQuery);
while ($row = $followUpsResult->fetch_assoc()) {
    $response['followUps'][] = $row;
}

$medRecordQuery = "
    SELECT p.id, p.full_name
    FROM patients p
    LEFT JOIN medical_records mr ON p.id = mr.patient_id
    WHERE mr.id IS NULL OR
        mr.blood_pressure IS NULL OR
        mr.height IS NULL OR
        mr.weight IS NULL OR
        mr.diagnosis IS NULL
";
$incompleteMedResult = $conn->query($medRecordQuery);
while ($row = $incompleteMedResult->fetch_assoc()) {
    $response['incompleteMedicalRecords'][] = $row;
}

echo json_encode($response);
$conn->close();
?>
