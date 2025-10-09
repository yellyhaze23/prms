<?php
require 'cors.php';
require 'config.php';

header("Content-Type: application/json");

$sql = "
    SELECT 
        p.id AS patient_id,
        p.full_name,
        p.address,
        mr.diagnosis AS disease
    FROM patients p
    LEFT JOIN (
        SELECT mr1.*
        FROM medical_records mr1
        INNER JOIN (
            SELECT patient_id, MAX(updated_at) as max_updated, MAX(id) as max_id
            FROM medical_records
            GROUP BY patient_id
        ) mr2 ON mr1.patient_id = mr2.patient_id AND mr1.updated_at = mr2.max_updated AND mr1.id = mr2.max_id
    ) mr ON p.id = mr.patient_id
    WHERE p.address IS NOT NULL AND p.address != ''
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $conn->error]);
    exit;
}

$patients = [];

while ($row = $result->fetch_assoc()) {
    // Clean up the disease field by trimming whitespace and newlines
    if (isset($row['disease'])) {
        $row['disease'] = trim($row['disease']);
    }
    $patients[] = $row;
}

echo json_encode($patients);
?>
